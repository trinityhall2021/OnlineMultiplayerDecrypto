from flask import Flask, render_template
from flask.json import jsonify
from flask_socketio import SocketIO
import random
from itertools import permutations, cycle

app = Flask(__name__)
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")

# TODO: setup UUID mechanisms so different rooms do not draw from 
# the same deck of codecards
codecards = list(permutations(range(1, 5), 3))
random.shuffle(codecards)
codecards = cycle(iter(codecards))

@app.route('/user')
def user():
    return '"brenda"'

def messageReceived(methods=['GET', 'POST']):
    print('message was received!!!')

@socketio.on('my event')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    print('received my event: ' + str(json))
    socketio.emit('my response', json, callback=messageReceived)

@socketio.on('interceptSubmitted')
def interceptSubmitted(json, methods=['GET', 'POST']):
    print("Received intercept: " + str(json))

@app.route('/requestClue')
def request_clue(methods=['GET', 'POST']):
    current_codecard = []
    current_codecard = next(codecards)
    print("Clue requested : " + str(current_codecard))
    return jsonify({"codecard": current_codecard})

if __name__ == '__main__':
    socketio.run(app, debug=True)
