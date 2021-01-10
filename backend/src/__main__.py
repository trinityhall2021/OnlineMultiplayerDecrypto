from __future__ import annotations
import random
import enum
import uuid
import logging
import dataclasses
from itertools import permutations, cycle
from typing import List, Optional
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
WORD_LIST = ["ANT", "BEE", "CAT", "DOG", "EGG", "FAT", "GOAT", "HAT", "ICE",
             "JELLY", "KING"]

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

    def to_json():
        return {'name': name, 'state': state}

def generate_word_list():
    # TODO: seed the random? 
    return random.sample(WORD_LIST, k=4)




@dataclasses.dataclass
class Team():
    players: List[Player] = dataclasses.field(default_factory=list)
    word_list: List[str] = dataclasses.field(default_factory=generate_word_list)
    intercepts: int = 0
    misses: int = 0
    endgame: EndCondition = EndCondition.NotYet

    def __len__(self):
        return len(self.players)

    def user_in_team(self, name: str):
        return name in [p.name for p in self.players]

    def add_player(self, player):
        player.team = self
        self.players.append(player)

    def to_json(self):
        return {
            'intercepts': self.intercepts,
            'misses': self.misses,
            'players': [p.name for p in self.players],
            'words': self.word_list
        }

@dataclasses.dataclass
class Game():
    red_team: Team = dataclasses.field(default_factory=Team)
    blue_team: Team = dataclasses.field(default_factory=Team)
    code_card: List[int] = dataclasses.field(default_factory=list)
    normal_guess: Optional[Tuple[int]] = None
    intercept_guess: Optional[Tuple[int]] = None
    starting_team: int = TeamColor.Red
    
    def get_team_turn(self):
        # return the current team's turn (defined by the player who is 
        # currently the cluegiver)
        for player in self.red_team.players:
            if player.state == PlayerState.Giving:
                return TeamColor.Red
        for player in self.blue_team.players:
            if player.state == PlayerState.Giving:
                return TeamColor.Blue
        # Todo: return an error code? 
        return TeamColor.Invalid

    def smaller_team(self):
        return min(self.red_team, self.blue_team, key=lambda t: len(t))

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
        opposing_team = None

        if (current_team == TeamColor.Invalid):
            # TODO: return an error code? 
            return 
        elif current_team == TeamColor.Red:
            opposing_team = TeamColor.Blue
        elif current_team == TeamColor.Blue:
            opposing_team = TeamColor.Red
        else:
            # TODO: return an error code? 
            return 

        if (normal_guess is None or intercept_guess is None):
            # TODO: return an error code? 
            return

        if code_card != normal_guess: 
            increase_misses(current_team) 
        if code_card == intercept:
            increase_intercepts(opposing_team)

        if (current_team != self.starting_team):
            calculate_win_condition()

    def calculate_win_condition(self):
        # If a team has two miscommunications, the team looses
        # If a team has two intercepts, the team wins 
        # return 0 if a win condition is not calculated, return 1 if a 
        # win condition is calculated 
        
        if (self.red_team.misses != NUM_MISSES_TO_LOSE and \
            self.blue_team.misses != NUM_MISSES_TO_LOSE and \
            self.red_team.intercepts != NUM_INTERCEPTS_TO_WIN and \
            self.blue_team.intercepts != NUM_INTERCEPTS_TO_WIN):
            return 0
        # end game condition is met, now we see whether is a win/lose situation or a tie
        if (self.red_team.intercepts == NUM_INTERCEPTS_TO_WIN) {
            # red team has the intercepts to win, check whether blue team has that 
            # as well
            if (self.blue_team.intercepts == NUM_INTERCEPTS_TO_WIN) {
                self.red_team.endgame = EndCondition.Tie
                self.blue_team.endgame = EndCondition.Tie
            }
        } else {
            # red team didnt have the intercepts to win 
        }
        pass


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

@socketio.on('submit_name')
def submit_name(json, methods=['GET', 'PUT', 'POST']):
    logger.info('submit_name')
    logger.info(json)
    room_id = json['room_id']
    player_name = json['player_name']
    game = GAMES[room_id]
    team = game.smaller_team()
    player = Player(
        name=player_name,
    )
    team.add_player(player)
    socketio.emit(
        'player_added',
        {
            'red_team': game.red_team.to_json(),
            'blue_team': game.blue_team.to_json(),
        }
    )

@socketio.on('connect')
def connect(methods=['GET', 'PUT', 'POST']):
    logger.info('connecting')

@socketio.on('submit_guess')
def guess_submitted(json, methods=['GET', 'PUT', 'POST']):
    print(json)
    socketio.emit('guess_submitted', json)

@app.route('/requestClue')
def request_clue(methods=['GET', 'POST']):
    current_codecard = []
    current_codecard = next(codecards)
    print("Clue requested : " + str(current_codecard))
    return jsonify({"codecard": current_codecard})

if __name__ == '__main__':
    socketio.run(app, debug=True)
