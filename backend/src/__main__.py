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
    Invalid = 'invalid'


def other_team_color(team: TeamColor):
    if team == TeamColor.Red:
        return TeamColor.Blue
    if team == TeamColor.Blue:
        return TeamColor.Red
    return TeamColor.Invalid


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

    def next_clue_giver(self):
        for n, player in enumerate(self.players):
            if player.state == PlayerState.Giving:
                return self.players[(n+1) % len(self.players)]
        raise ValueError()

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
    code: Optional[Tuple[int]] = None
    normal_guess: Optional[Tuple[int]] = None
    intercept_guess: Optional[Tuple[int]] = None

    def get_team(self, team_color: TeamColor):
        if team_color == TeamColor.Blue:
            return self.blue_team
        elif team_color == TeamColor.Red:
            return self.red_team
        else:
            raise ValueError()

    def smaller_team(self):
        return min(self.red_team, self.blue_team, key=lambda t: len(t))

    def update_player_states(self):
        normal_team = self.get_team_turn()
        intercepting_team = other_team_color(normal_team)
        if self.normal_guess and self.intercept_guess:
            clue_giver = intercepting_team.next_clue_giver()
            for player in normal_team:
                player.state = PlayerState.Intercepting
            for player in intercepting_team:
                player.state = PlayerState.Receiving
            clue_giver.state = PlayerState.Giving


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
    room_id = json['room_id']
    guess = json['guess']
    guess_type = json['guess_type']
    game = GAMES[room_id]
    if guess_type == 'intercept':
        game.intercept_guess = tuple(guess)
    if guess_type == 'normal':
        game.normal_guess = tuple(guess)
    if game.intercept_guess and game.normal_guess:
        game.tally_score()
    game.update_player_states()


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

@app.route('/requestClue')
def request_clue(methods=['GET', 'POST']):
    current_codecard = []
    current_codecard = next(codecards)
    print("Clue requested : " + str(current_codecard))
    return jsonify({"codecard": current_codecard})

if __name__ == '__main__':
    socketio.run(app, debug=True)
