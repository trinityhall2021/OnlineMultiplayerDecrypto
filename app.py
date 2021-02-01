from __future__ import annotations
import random
import enum
import uuid
import logging
import dataclasses
from itertools import permutations, cycle
from typing import List, Optional, Tuple, DefaultDict, Dict
from collections import defaultdict

from flask import Flask, render_template, request
from flask.json import jsonify
from flask_socketio import SocketIO, join_room, leave_room  # type: ignore
import namegenerator  # type: ignore

from words import WORD_LIST
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_url_path='')
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")

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
        return {
            TeamColor.RED: TeamColor.BLUE,
            TeamColor.BLUE: TeamColor.RED
        }[team_color]


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
    sid: str
    state: PlayerState = PlayerState.Waiting

    def to_json(self):
        return {'name': self.name, 'state': self.state}


def generate_words():
    # TODO: seed the random?
    return random.sample(WORD_LIST, k=4)

def generate_list_of_list():
    ret_val = list()
    for i in range(4):
        ret_val.append(list())
    return ret_val

@dataclasses.dataclass
class Team():
    color: TeamColor
    players: List[Player] = dataclasses.field(default_factory=list)
    word_list: List[str] = dataclasses.field(default_factory=generate_words)
    submitted_clues: List[List] = dataclasses.field(default_factory=generate_list_of_list)
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

    def remove_player(self, player: Player):
        if player in self.players:
            self.players.remove(player)

    def next_clue_giver(self):
        return self.players[(self.num_code_gives + 1) % len(self.players)]

    def to_json(self):
        return {
            'color': self.color.name,
            'intercepts': self.intercepts,
            'misses': self.misses,
            'players': [p.to_json() for p in self.players],
            'endgame': self.endgame,
            'words': self.word_list,
            'previous_clues': self.submitted_clues
        }


@dataclasses.dataclass
class Game():
    teams: List[Team, Team] = dataclasses.field(
        default_factory=lambda:
        [Team(color=TeamColor.RED),
         Team(color=TeamColor.BLUE)])
    code_card: Optional[List[int]] = None
    normal_guess: Optional[List[int]] = None
    intercept_guess: Optional[List[int]] = None
    given_clue: Optional[List[str]] = None
    name: str = None
    # indicate whether we are mid turn, this prevents other players from joining and
    # resetting the
    turn_in_progress: bool = False
    num_turns: int = 0

    def __post_init__(self):
        self.starting_team = self.teams[TeamColor.RED.value]
        self.code_card = next(codecards)

    def remove_player(self, player: Player):
        for team in self.teams:
            team.remove_player(player)

    def get_player(self, user: str) -> Optional[Player]:
        for team in self.teams:
            for player in team:
                if player.name == user:
                    return player

    def get_player_by_sid(self, sid: str) -> Optional[Player]:
        for team in self.teams:
            for player in team:
                if player.sid == sid:
                    return player

    def get_player_index(self, user: str) -> int:
        for team in self.teams:
            for p in range(len(team.players)):
                if team.players[p].name == user:
                    return p
        return -1

    def get_team(self, team_color: TeamColor):
        return self.teams[team_color.value]

    def is_empty(self):
        if len(self.teams[0]) == 0 and len(self.teams[1]) == 0:
            return True
        else:
            return False

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
                if player.state == PlayerState.Giving or player.state == PlayerState.Guessing or player.state == PlayerState.Guessed:
                    other_team_color = TeamColor.other(team.color)
                    other_team = self.get_team(other_team_color)
                    return team, other_team

    def smallest_team(self):
        return min(self.teams, key=lambda t: len(t))

    def send_new_game_states(self):
        message = self.to_json()
        socketio.emit('update_game', message, room=self.name)

    def send_new_player_and_game_states(self):
        for player in self.teams[TeamColor.RED.value]:
            socketio.emit('update_player_and_game',
                          self.user_json(player.name),
                          room=player.sid)
        for player in self.teams[TeamColor.BLUE.value]:
            socketio.emit('update_player_and_game',
                          self.user_json(player.name),
                          room=player.sid)

    def send_clue(self):
        message = self.clue_to_json()
        print(message)
        message = {'clueData': message}
        socketio.emit('update_clues', message, room=self.name)

    def update_and_send_player_states_after_join(self):
        """
        Another user joins the game, set the first clue giver and 
        keep other players in waiting state
        TODO: Handle the situation where users join WHILE the game is in 
        progress
        """
        if all(len(t) >= 2 for t in self.teams):
            red_team = self.teams[TeamColor.RED.value]
            blue_team = self.teams[TeamColor.BLUE.value]
            for player in blue_team:
                player.state = PlayerState.Waiting
            for player in red_team:
                player.state = PlayerState.Waiting
            red_team.players[0].state = PlayerState.Giving
        message = self.to_json()
        logger.info("sending player_added message")
        logger.info(message)
        socketio.emit('player_added', message, room=self.name)
        self.send_new_player_and_game_states()


    def update_and_send_player_states_after_submit_clue(self, submitted_clues):
        """
        A clue is submitted from the clue giver, update all players
        from waiting to intercept/guessing state, and the clue giver 
        to waiting state
        """
        guessing_team, intercepting_team = self.get_team_turns()
        for player in guessing_team:
            if player.state == PlayerState.Giving:
                player.state = PlayerState.Waiting
            else:
                player.state = PlayerState.Guessing
        for player in intercepting_team:
            player.state = PlayerState.Intercepting
        self.given_clue = submitted_clues
        logger.info("given clues: {}".format(self.given_clue))
        self.send_new_player_and_game_states()
        self.send_clue()

    def update_and_send_player_states_after_guess(self):
        guessing_team, intercepting_team = self.get_team_turns()
        if self.normal_guess and self.intercept_guess:
            # both guesses are given, update the code card as well as each others roles
            clue_giver = intercepting_team.next_clue_giver()
            for player in guessing_team:
                player.state = PlayerState.Intercepting
            for player in intercepting_team:
                player.state = PlayerState.Guessing
            clue_giver.state = PlayerState.Giving
            self.code_card = next(codecards)
            self.normal_guess = None
            self.intercept_guess = None
            self.send_new_player_and_game_states()
        elif self.normal_guess:
            # only normal guess is set
            for player in guessing_team:
                player.state = PlayerState.Guessed
            self.send_new_game_states()
        elif self.intercept_guess:
            # only intercept guess is set
            for player in intercepting_team:
                player.state = PlayerState.Intercepted
            self.send_new_game_states()


    def update_previous_clues_list(self):
        """
        Add given_clues to the previous clues list in order to show the guessers what they guessed 
        """
        guessing_team, _ = self.get_team_turns()
        for i in range(3):
            guessing_team.submitted_clues[self.code_card[i]-1].append(self.given_clue[i])


    def tally_score(self):
        guessing_team, intercepting_team = self.get_team_turns()

        if (self.normal_guess is None or self.intercept_guess is None):
            logger.error('Both guesses must be supplied to tally score')
            return

        logger.info(self.code_card)
        logger.info(self.normal_guess)
        logger.info(self.intercept_guess)
        if self.code_card != self.normal_guess:
            guessing_team.misses += 1
        if self.code_card == self.intercept_guess:
            intercepting_team.intercepts += 1

        if (guessing_team.num_code_gives == intercepting_team.num_code_gives):
            ret_val = self.calculate_win_condition()

    def calculate_win_condition(self):
        # If a team has two miscommunications, the team looses
        # If a team has two intercepts, the team wins
        # return 0 if a win condition is not calculated, return 1 if a
        # win condition is calculated
        red_team = self.get_team(TeamColor.RED)
        blue_team = self.get_team(TeamColor.BLUE)
        logger.info("red team: {}/{} (intercepts/misses)".format(
            red_team.intercepts, red_team.misses))
        logger.info("blue team: {}/{} (intercepts/misses)".format(
            blue_team.intercepts, blue_team.misses))

        if (red_team.misses != NUM_MISSES_TO_LOSE and \
            blue_team.misses != NUM_MISSES_TO_LOSE and \
            red_team.intercepts != NUM_INTERCEPTS_TO_WIN and \
            blue_team.intercepts != NUM_INTERCEPTS_TO_WIN and \
            red_team.num_code_gives < 8 and blue_team.num_code_gives < 8):
            return 0

        # end game condition is met, now we tally the score
        red_team_score = red_team.intercepts - red_team.misses
        blue_team_score = blue_team.intercepts - blue_team.misses
        if (red_team_score > blue_team_score):
            # red team wins, blue team loses
            self.teams[TeamColor.RED].endgame = EndCondition.Win
            self.teams[TeamColor.BLUE].endgame = EndCondition.Loss
        elif (red_team_score < blue_team_score):
            # blue team wins, red team loses
            self.teams[TeamColor.RED].endgame = EndCondition.Loss
            self.teams[TeamColor.BLUE].endgame = EndCondition.Win
        else:
            self.teams[TeamColor.RED].endgame = EndCondition.Tie
            self.teams[TeamColor.BLUE].endgame = EndCondition.Tie
        return 1

    def to_json(self):
        game_json = {'teams': [t.to_json() for t in self.teams]}

        # remove the words since different teams do not need to
        # know the words from the other team
        del game_json['teams'][0]['words']
        del game_json['teams'][1]['words']
        return game_json

    def clue_to_json(self):
        if self.given_clue is None or len(self.given_clue) < 3:
            clue_json = {
                "clue0": "",
                "clue1": "",
                "clue2": ""
            }
        else :
            clue_json = {
                "clue0": self.given_clue[0],
                "clue1": self.given_clue[1],
                "clue2": self.given_clue[2]
            }
        return clue_json

    def user_json(self, player_name):
        game_json = self.to_json()
        player = self.get_player(player_name)
        # TODO: elegantly handle player == None
        team_color = self.get_team_color(player_name)
        print 
        player_json = {
            'teamIndex': team_color,
            'playerIndex': self.get_player_index(player_name),
            'userState': player.state,
            'codeCard': self.code_card,
            'words': self.get_team(team_color).word_list
        }

        message = {'gameData': game_json, 'playerData': player_json, 'clueData': self.clue_to_json()}

        return message


GAMES: DefaultDict[str, Game] = defaultdict(Game)
SID_TO_GAME: Dict[str, Game] = {}


@app.route('/state')
def state():
    logger.info("In state() function")
    logger.info(request.args)
    room_id = request.args['room_id']
    user = request.args['user']
    game = GAMES[room_id]
    game_json = game.user_json(player_name=user)
    return game_json


@app.route('/create_room')
def create_room():
    # user wants to create a room , create a room with a unique name
    logger.info("User requested a room to be created")
    new_room_name = ""
    while (new_room_name in GAMES or len(new_room_name) == 0):
        new_room_name = namegenerator.gen()
    GAMES[new_room_name] = Game(name=new_room_name)
    print(GAMES)
    return jsonify(room_name=new_room_name)

@app.route('/join_room')
def join_specified_room():
    # user wants to join a room, make sure the room exists
    logger.info("User requested to join a room")
    logger.info(request.args)
    room_id = request.args['room_id']
    if room_id not in GAMES:
        # room id is not in games, the redirection didn't succeed 
        return jsonify(found_room="failed")
    else:
        # return success status
        return jsonify(found_room="succeed")



@socketio.on('submit_clues')
def submit_clues(json, methods=['GET', 'PUT', 'POST']):
    """
    A clue is submitted, store it in the game class and send the clue 
    information to everyone else 
    """
    logger.info('submit_clue')
    logger.info(json)
    room_id = json['room_id']
    playername = json['player']
    clues = json['clues']
    game = GAMES[room_id]
    # TODO: add clues as properties of the game? 
    game.update_and_send_player_states_after_submit_clue(clues)


@socketio.on('submit_guess')
def submit_guess(json, methods=['GET', 'PUT', 'POST']):
    logger.info(json)
    room_id = json['room_id']
    guess = json['guess']
    guess_type = json['guess_type']
    playername = json['player']
    game = GAMES[room_id]
    logger.info(game)
    player = game.get_player(playername)
    if player is None:
        logger.warning('user not in game: %s', playername)
        return
    should_update = False
    if guess_type == PlayerState.Intercepting:
        if player.state == PlayerState.Intercepting:
            game.intercept_guess = tuple(guess)
            should_update = True
            logger.info("accepted intercept guess from {}: {}".format(
                player.name, game.intercept_guess))
        else:
            logger.warning('player submitted invalid guess')
    if guess_type == PlayerState.Guessing:
        if player.state == PlayerState.Guessing:
            game.normal_guess = tuple(guess)
            should_update = True
            logger.info("accepted normal guess from {}: {}".format(
                player.name, game.intercept_guess))
        else:
            logger.warning('player submitted invalid guess')
    if should_update:
        if game.intercept_guess and game.normal_guess:
            guessing_team, _ = game.get_team_turns()
            game.update_previous_clues_list()
            guessing_team.num_code_gives += 1
            game.tally_score()
        game.update_and_send_player_states_after_guess()
    else:
        logger.warning('Not updating due to invalid request')
    logger.info(game)


@socketio.on('submit_name')
def submit_name(json, methods=['GET', 'PUT', 'POST']):
    logger.info('submit_name')
    logger.info('sid: %s', request.sid)
    logger.info(json)
    room_id = json['room_id']
    player_name = json['player_name']
    game = GAMES[room_id]
    if not player_name:
        socketio.emit('error_joining',
                      {'err_msg': 'You must provide a name'},
                      room=request.sid)
        return
    if game.get_player(player_name):
        socketio.emit('error_joining',
                      {'err_msg': 'Your name is already taken'},
                      room=request.sid)
        return
    if all(len(t) == 0 for t in game.teams):
        team = game.starting_team
    else:
        team = game.smallest_team()
    player = Player(name=player_name, sid=request.sid)
    team.add_player(player)
    SID_TO_GAME[request.sid] = game
    join_room(room_id)
    socketio.emit('user_joined',
                  {'room_id': room_id, 'username': player_name},
                  room=request.sid)
    game.update_and_send_player_states_after_join()


@socketio.on('connected')
def connected():
    print("Client connected")
    SID_TO_GAME[request.sid] = None
    #clients.append(request.namespace)


@socketio.on('disconnect')
def disconnect():
    game = SID_TO_GAME.get(request.sid)
    logger.info('sid: %s', request.sid)
    logger.info('game: %s', game)
    if game:
        game.remove_player(game.get_player_by_sid(request.sid))
        if game.is_empty():
            logger.info('deleting game: %s', game)
            del GAMES[game.name]
            logger.info('number of games: %s', len(GAMES))
        else:
            game.send_new_game_states()
    print('Client disconnected')


@socketio.on('connect')
def connect(methods=['GET', 'PUT', 'POST']):
    logger.info('connecting')


@app.route('/')
def home():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
