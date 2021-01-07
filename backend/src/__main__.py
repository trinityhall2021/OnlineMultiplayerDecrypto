from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")

game = {}

@app.route('/user')
def user():
    return '"brenda"'

@socketio.on('guess_submitted')
def guess_submitted(json, methods=['GET', 'PUT', 'POST']):
    socketio.emit('guess_received', json)

if __name__ == '__main__':
    socketio.run(app, debug=True)
