from __future__ import annotations
import random
import enum
import uuid
import logging
import dataclasses
from itertools import permutations, cycle
from typing import List, Optional, Tuple, DefaultDict
from collections import defaultdict

from flask import Flask, render_template, request
from flask.json import jsonify
from flask_socketio import SocketIO # type: ignore
import namegenerator # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")
WORD_LIST = [
    "ANT", "BEE", "CAT", "DOG", "EGG", "FAT", "GOAT", "HAT", "ICE", "JELLY",
    "KING"
]

# TODO: setup UUID mechanisms so different rooms do not draw from
# the same deck of codecards
codecards_list = list(permutations(range(1, 5), 3))
random.shuffle(codecards_list)
codecards = cycle(iter(codecards_list))

NUM_INTERCEPTS_TO_WIN = 2
NUM_MISSES_TO_LOSE = 2


class TeamColor(int, enum.Enum):
    RED = 0
    BLUE = 1

    @classmethod
    def other(cls, team_color: TeamColor):
        return {TeamColor.RED: TeamColor.BLUE,
                TeamColor.BLUE: TeamColor.RED}[team_color]


class PlayerState(str, enum.Enum):
    Waiting = 'waiting'
    Intercepting = 'intercepting'
    Intercepted = 'intercepted'
    Giving = 'giving'
    Gave = 'gave'
    Guessing = 'guessing'
    Guessed = 'guessed'


class EndCondition(str, enum.Enum):
    Win = 'win'
    Loss = 'loss'
    Tie = 'tie'
    NotYet = 'not yet'


@dataclasses.dataclass
class Player():
    name: str
    state: PlayerState = PlayerState.Waiting

    def to_json(self):
        return {'name': self.name, 'state': self.state}


def generate_words():
    # TODO: seed the random?
    return random.sample(WORD_LIST, k=4)


@dataclasses.dataclass
class Team():
    color: TeamColor
    players: List[Player] = dataclasses.field(default_factory=list)
    word_list: List[str] = dataclasses.field(default_factory=generate_words)
    num_code_gives: int = 0
    intercepts: int = 0
    misses: int = 0
    endgame: EndCondition = EndCondition.NotYet

    def __len__(self):
        return len(self.players)

    def __iter__(self):
        return iter(self.players)

    def user_in_team(self, name: str):
        return name in [p.name for p in self.players]

    def add_player(self, player):
        self.players.append(player)

    def next_clue_giver(self):
        return self.players[(self.num_code_gives + 1) % len(self.players)]

    def to_json(self):
        return {
            'color': self.color.name,
            'intercepts': self.intercepts,
            'misses': self.misses,
            'players': [p.to_json() for p in self.players],
            'endgame': self.endgame,
            'words': self.word_list
        }


@dataclasses.dataclass
class Game():
    teams: List[Team, Team] = dataclasses.field(
        default_factory=lambda: [Team(color=TeamColor.RED), Team(color=TeamColor.BLUE)])
    code_card: Optional[List[int]] = None
    normal_guess: Optional[List[int]] = None
    intercept_guess: Optional[List[int]] = None

    def __post_init__(self):
        self.starting_team = self.teams[TeamColor.RED.value]

    def get_player(self, user: str) -> Optional[Player]:
        for team in self.teams:
            for player in team:
                if player.name == user:
                    return player
        return None

    def get_team(self, team_color: TeamColor):
        return self.teams[team_color.value]

    def get_team_color(self, username: str):
        # TODO: failsafe
        for team in self.teams:
            for player in team:
                if player.name == username:
                    return team.color

    def get_team_turns(self) -> Tuple[TeamColor, TeamColor]:
        # Returns the guessing team and intercepting team respectively
        for team in self.teams:
            for player in team:
                if player.state == PlayerState.Giving:
                    other_team_color = TeamColor.other(team.color)
                    other_team = self.get_team(other_team_color)
                    return team, other_team

    def smallest_team(self):
        return min(self.teams, key=lambda t: len(t))

    def update_player_states_after_join(self):
        if all(len(t) >= 2 for t in self.teams):
            red_team = self.teams[TeamColor.RED.value]
            blue_team = self.teams[TeamColor.BLUE.value]
            for player in blue_team:
                player.state = PlayerState.Intercepting
            for player in red_team:
                player.state = PlayerState.Guessing
            red_team.players[0].state = PlayerState.Giving

    def update_player_states_after_guess(self):
        guessing_team, intercepting_team = self.get_team_turns()
        if self.normal_guess and self.intercept_guess:
            guessing_team.num_code_gives += 1
            clue_giver = intercepting_team.next_clue_giver()
            for player in guessing_team:
                player.state = PlayerState.Intercepting
            for player in intercepting_team:
                player.state = PlayerState.Guessing
            clue_giver.state = PlayerState.Giving

    def tally_score(self):
        guessing_team, intercepting_team = self.get_team_turns()

        if (self.normal_guess is None or self.intercept_guess is None):
            logger.error('Both guesses must be supplied to tally score')
            return

        if self.code_card != self.normal_guess:
            guessing_team.misses += 1
        if self.code_card == self.intercept_guess:
            intercepting_team.intercepts += 1

        if (current_team != self.starting_team):
            self.num_turns += 1
            # TODO: Emit a win / loss condition 
            ret_val = self.calculate_win_condition()
            if (ret_val == 1):
                self.emit_results()

    def calculate_win_condition(self):
        
        # If a team has two miscommunications, the team looses
        # If a team has two intercepts, the team wins 
        # return 0 if a win condition is not calculated, return 1 if a 
        # win condition is calculated 
        if (self.red_team.misses != NUM_MISSES_TO_LOSE and \
            self.blue_team.misses != NUM_MISSES_TO_LOSE and \
            self.red_team.intercepts != NUM_INTERCEPTS_TO_WIN and \
            self.blue_team.intercepts != NUM_INTERCEPTS_TO_WIN and \
            self.num_turns < 8):
            return 0
        
        # end game condition is met, now we tally the score
        red_team_score = self.red_team.intercepts - self.red_team.misses
        blue_team_score = self.blue_team.intercepts - self.blue_team.misses
        if (red_team_score > blue_team_score) :
            # red team wins, blue team loses
            self.red_team.endgame = EndCondition.Win
            self.blue_team.endgame = EndCondition.Loss
        elif (red_team_score < blue_team_score) :
            # blue team wins, red team loses
            self.red_team.endgame = EndCondition.Loss
            self.blue_team.endgame = EndCondition.Win
        else:
            self.red_team.engame = EndCondition.Tie
            self.blue_team.engame = EndCondition.Tie
        return 1

    def to_json(self):
        return {'teams': [t.to_json() for t in self.teams]}

    def user_json(self, username):
        game_json = self.to_json()
        game_json.update({'teamIndex': self.get_team_color(username)})
        player = self.get_player(username)
        if player is not None and player.state == PlayerState.Giving:
            self.code_card = next(codecards)
        else:
            self.code_card = []
        game_json.update({'codeCard': self.code_card})
        return game_json


GAMES: DefaultDict[str, Game] = defaultdict(Game)


@app.route('/state')
def state():
    room_id = request.args['room_id']
    user = request.args['user']
    game = GAMES[room_id]
    return game.user_json(username=user)


@socketio.on('submit_guess')
def submit_guess(json, methods=['GET', 'PUT', 'POST']):
    logger.info(json)
    room_id = json['room_id']
    guess = json['guess']
    guess_type = json['guess_type']
    user = json['user']
    game = GAMES[room_id]
    logger.info(game)
    player = game.get_player(user)
    if player is None:
        logger.warning('user not in game: %s', user)
        return
    should_update = False
    if guess_type == 'intercept':
        if player.state == PlayerState.Intercepting:
            game.intercept_guess = guess
            should_update = True
        else:
            logger.warning('player submitted invalid guess')
    if guess_type == 'normal':
        if player.state == PlayerState.Guessing:
            game.normal_guess = guess
            should_update = True
        else:
            logger.warning('player submitted invalid guess')
    if should_update:
        if game.intercept_guess and game.normal_guess:
            game.tally_score()
        game.update_player_states_after_guess()
        message = game.to_json()
        logger.info(message)
        socketio.emit('player_added', message)
    else:
        logger.warning('Not updating due to invalid request')
    logger.info(game)


@socketio.on('submit_name')
def submit_name(json, methods=['GET', 'PUT', 'POST']):
    logger.info('submit_name')
    logger.info(json)
    room_id = json['room_id']
    player_name = json['player_name']
    game = GAMES[room_id]
    if all(len(t) == 0 for t in game.teams):
        team = game.starting_team
    else:
        team = game.smallest_team()
    player = Player(name=player_name)
    team.add_player(player)
    game.update_player_states_after_join()
    message = game.to_json()
    logger.info(message)
    socketio.emit('player_added', message)


@socketio.on('connect')
def connect(methods=['GET', 'PUT', 'POST']):
    logger.info('connecting')


@app.route('/requestClue')
def request_clue(methods=['GET', 'POST']):
    current_codecard = []
    current_codecard = next(codecards)
    print("Clue requested : " + str(current_codecard))
    return jsonify({"codecard": current_codecard})


if __name__ == '__main__':
    socketio.run(app, debug=True)
