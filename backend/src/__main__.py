from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")

game = {}

@app.route('/user')
def user():
    return '"brenda"'

@socketio.on('submit_guess')
def guess_submitted(json, methods=['GET', 'PUT', 'POST']):
    print(json)
    socketio.emit('guess_submitted', json)


if __name__ == '__main__':
    socketio.run(app, debug=True)
