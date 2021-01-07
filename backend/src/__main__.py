from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'helloworld'
socketio = SocketIO(app, cors_allowed_origins="*")


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


if __name__ == '__main__':
    socketio.run(app, debug=True)
