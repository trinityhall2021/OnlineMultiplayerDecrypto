from __future__ import annotations
import random
import enum
import uuid
import logging
import dataclasses
from itertools import permutations, cycle
from typing import List, Optional, Tuple
from collections import defaultdict

from flask import Flask, render_template, request
from flask.json import jsonify
from flask_socketio import SocketIO
import namegenerator

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
codecards = list(permutations(range(1, 5), 3))
random.shuffle(codecards)
codecards = cycle(iter(codecards))

NUM_INTERCEPTS_TO_WIN = 2
NUM_MISSES_TO_LOSE = 2


class TeamColor(str, enum.Enum):
    Red = 'red'
    Blue = 'blue'
    Invalid = 'invalid'


def other_team_color(team: TeamColor):
    if team == TeamColor.Red:
        return TeamColor.Blue
    if team == TeamColor.Blue:
        return TeamColor.Red
    logger.warning('invalid team color: %s', team)
    return TeamColor.Invalid


class PlayerState(str, enum.Enum):
    Waiting = 'waiting'
    Intercepting = 'intercepting'
    Giving = 'giving'
    Receiving = 'receiving'


class EndCondition(str, enum.Enum):
    Win = 'win'
    Loss = 'loss'
    Tie = 'tie'
    NotYet = 'not yet'


@dataclasses.dataclass
class Player():
    name: str
    state: PlayerState = PlayerState.Waiting
    team: Optional[Team] = None

    def to_json(self):
        return {'name': self.name, 'state': self.state}


def generate_word_list():
    # TODO: seed the random?
    return random.sample(WORD_LIST, k=4)


@dataclasses.dataclass
class Team():
    players: List[Player] = dataclasses.field(default_factory=list)
    word_list: List[str] = dataclasses.field(
        default_factory=generate_word_list)
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
        player.team = self
        self.players.append(player)

    def next_clue_giver(self):
        return self.players[(self.num_code_gives + 1) % len(self.players)]

    def to_json(self):
        return {
            'intercepts': self.intercepts,
            'misses': self.misses,
            'players': [p.to_json() for p in self.players],
            'words': self.word_list
        }


@dataclasses.dataclass
class Game():
    red_team: Team = dataclasses.field(default_factory=Team)
    blue_team: Team = dataclasses.field(default_factory=Team)
    code_card: Optional[Tuple[int]] = None
    normal_guess: Optional[Tuple[int]] = None
    intercept_guess: Optional[Tuple[int]] = None
    starting_team: int = TeamColor.Red

    def get_player(self, user: str) -> Player:
        for player in self.red_team.players + self.blue_team.players:
            if player.name == user:
                return player

    def get_team(self, team_color: TeamColor):
        if team_color == TeamColor.Blue:
            return self.blue_team
        elif team_color == TeamColor.Red:
            return self.red_team
        else:
            raise ValueError(f'Cannot get invalid team color: {team_color}')

    def get_team_turn(self):
        # return the current team's turn (defined by the player who is
        # currently the cluegiver)
        logger.info('getting team turn')
        for player in self.red_team:
            if player.state == PlayerState.Giving:
                return TeamColor.Red
        for player in self.blue_team:
            if player.state == PlayerState.Giving:
                return TeamColor.Blue
        # Todo: return an error code?
        return TeamColor.Invalid

    def smaller_team(self):
        return min(self.red_team, self.blue_team, key=lambda t: len(t))

    def update_player_states_after_join(self):
        if len(self.red_team) >= 2 and len(self.blue_team) >= 2:
            for player in self.blue_team:
                player.state = PlayerState.Intercepting
            for player in self.red_team:
                player.state = PlayerState.Receiving
            self.red_team.players[0].state = PlayerState.Giving

    def update_player_states_after_guess(self):
        normal_team_color = self.get_team_turn()
        normal_team = self.get_team(normal_team_color)
        intercepting_team = self.get_team(other_team_color(normal_team_color))
        if self.normal_guess and self.intercept_guess:
            normal_team.num_code_gives += 1
            clue_giver = intercepting_team.next_clue_giver()
            for player in normal_team:
                player.state = PlayerState.Intercepting
            for player in intercepting_team:
                player.state = PlayerState.Receiving
            clue_giver.state = PlayerState.Giving

    def increase_misses(self, current_team):
        if (current_team == TeamColor.Red):
            self.red_team.misses += 1
        elif (current_team == TeamColor.Blue):
            self.blue_team.misses += 1
        # TODO: return error code?

    def increase_intercepts(self, current_team):
        if (current_team == TeamColor.Red):
            self.red_team.intercepts += 1
        elif (current_team == TeamColor.Blue):
            self.blue_team.intercepts += 1
        # TODO: return error code?

    def tally_score(self):
        current_team = self.get_team_turn()
        opposing_team = other_team_color(current_team)

        if (self.normal_guess is None or self.intercept_guess is None):
            logger.error('Both guesses must be supplied to tally score')
            return

        if self.code_card != self.normal_guess:
            self.increase_misses(current_team)
        if self.code_card == self.intercept_guess:
            self.increase_intercepts(opposing_team)

        if (current_team != self.starting_team):
            calculate_win_condition()

    def calculate_win_condition(self):
        # If a team has two miscommunications, the team looses
        # If a team has two intercepts, the team wins
        # return 0 if a win condition is not calculated, return 1 if a
        # win condition is calculated

        if (self.red_team.misses != NUM_MISSES_TO_LOSE
                and self.blue_team.misses != NUM_MISSES_TO_LOSE
                and self.red_team.intercepts != NUM_INTERCEPTS_TO_WIN
                and self.blue_team.intercepts != NUM_INTERCEPTS_TO_WIN):
            return 0
        # end game condition is met, now we see whether is a win/lose situation or a tie
        if (self.red_team.intercepts == NUM_INTERCEPTS_TO_WIN):
            # red team has the intercepts to win, check whether blue team has that
            # as well
            if (self.blue_team.intercepts == NUM_INTERCEPTS_TO_WIN):
                self.red_team.endgame = EndCondition.Tie
                self.blue_team.endgame = EndCondition.Tie


GAMES = defaultdict(Game)


@app.route('/state')
def state():
    room_id = request.args['room_id']
    user = request.args['user']
    game = GAMES[room_id]
    if game.red_team.user_in_team(user):
        team_color = TeamColor.Red
    else:
        team_color = TeamColor.Blue
    return {
        'red_team': game.red_team.to_json(),
        'blue_team': game.blue_team.to_json(),
        'team': team_color
    }


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
            game.intercept_guess = tuple(guess)
            should_update = True
        else:
            logger.warning('player submitted invalid guess')
    if guess_type == 'normal':
        if player.state == PlayerState.Receiving:
            game.normal_guess = tuple(guess)
            should_update = True
        else:
            logger.warning('player submitted invalid guess')
    if should_update:
        if game.intercept_guess and game.normal_guess:
            game.tally_score()
        game.update_player_states_after_guess()
        message = {
            'red_team': game.red_team.to_json(),
            'blue_team': game.blue_team.to_json(),
        }
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
    if len(game.red_team) == 0 and len(game.blue_team) == 0:
        team = game.get_team(game.starting_team)
    else:
        team = game.smaller_team()
    player = Player(name=player_name, )
    team.add_player(player)
    game.update_player_states_after_join()
    message = {
        'red_team': game.red_team.to_json(),
        'blue_team': game.blue_team.to_json(),
    }
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
