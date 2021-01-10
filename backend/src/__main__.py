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


class TeamColor(str, enum.Enum):
    Red = 'red'
    Blue = 'blue'


class PlayerState(str, enum.Enum):
    Waiting = 'waiting'
    Intercepting = 'intercepting'
    Giving = 'giving'
    Receiving = 'receiving'

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

    def smaller_team(self):
        return min(self.red_team, self.blue_team, key=lambda t: len(t))


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
