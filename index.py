from flask import *
from flask_socketio import SocketIO, send
from markupsafe import escape

app = Flask(__name__)
app.config['SECRET_KEY'] = 'Qj4kn6N7uRAEcCAHh8bZKUqD'
socketio = SocketIO(app, cors_allowed_origins='*')


if __name__ == "__main__":
    socketio.run(app, host='localhost', debug=True, allow_unsafe_werkzeug=True)
    # app.run(debug=True)


@socketio.on('message')
def handle_message(message):
    print("Received: " + message)
    if message != "User connected!":
        send(message, broadcast=True)


@socketio.on('drone_connection')
def drone_connection(response):
    print(response)
    send(response, broadcast=True)


@socketio.on('cur_drone_gps')
def cur_drone_gps(response):
    print(response)
    send(response)


@socketio.on('drone_settings')
def drone_settings(response):
    print(response)
    send(response)


@app.route('/chat')
def chat():
    return render_template('tests/chat.html')


@app.route('/admin')
def index():
    return render_template('tests/test.html')


@app.route('/')
def admin():
    return render_template('admin/adminLTE.html')


@app.route('/map')
def map():
    return render_template('tests/map.html')


@app.route('/login')
def login():
    return 'login'


@app.route('/user/<username>')
def profile(username):
    return f'{username}\'s profile'


# with app.test_request_context():
#     print(url_for('index'))
#     print(url_for('login'))
#     print(url_for('login', next='/'))
#     print(url_for('profile', username='John Doe'))
