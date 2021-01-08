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

# TODO: setup UUID mechanisms so different rooms do not draw from 
# the same deck of codecards
codecards = list(permutations(range(1, 5), 3))
random.shuffle(codecards)
codecards = cycle(iter(codecards))


class PlayerState(str, enum.Enum):
    INTERCEPTING: 'INTERCEPTING'
    GIVING: 'GIVING'
    RECEIVING: 'RECEIVING'


@dataclasses.dataclass
class Player():
    name: str
    team: Optional[Team] = None


@dataclasses.dataclass
class Team():
    players: List[Player] = dataclasses.field(default_factory=list)
    intercepts: int = 0
    miscommunications: int = 0

    def __len__(self):
        return len(self.players)

    def add_player(self, player):
        player.team = self
        self.players.append(player)

    def to_json(self):
        return {
            'intercepts': self.intercepts,
            'miscommunications': self.intercepts,
            'players': [p.name for p in self.players],
        }

@dataclasses.dataclass
class Game():
    red_team: Team = dataclasses.field(default_factory=Team)
    blue_team: Team = dataclasses.field(default_factory=Team)

    def smaller_team(self):
        return min(self.red_team, self.blue_team, key=lambda t: len(t))


GAMES = defaultdict(Game)


@app.route('/user')
def user():
    return '"brenda"'

@socketio.on('connect')
def connect(methods=['GET', 'PUT', 'POST']):
    room_id = request.args['room_id']
    game = GAMES[room_id]
    logger.info('connect')
    logger.info(game)
    team = game.smaller_team()
    player = Player(
        name=namegenerator.gen(),
    )
    team.add_player(player)
    socketio.emit(
        'player_added',
        {
            'red_team': game.red_team.to_json(),
            'blue_team': game.blue_team.to_json(),
        }
    )

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
