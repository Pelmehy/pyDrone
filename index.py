from flask import *
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS, cross_origin
from markupsafe import escape

app = Flask(__name__)
app.config['SECRET_KEY'] = 'Qj4kn6N7uRAEcCAHh8bZKUqD'
socketio = SocketIO(app, cors_allowed_origins='*')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

if __name__ == "__main__":
    socketio.run(app, host='localhost', debug=True, allow_unsafe_werkzeug=True)
    # app.run(debug=True)


@socketio.on('message')
def message(response):
    print("Received: " + response)
    if response != "User connected!":
        send(response, broadcast=True)


@socketio.on('drone_connection')
def drone_connection(response):
    print('drone_connection')
    print(response)
    emit('drone_connection', response, broadcast=True)


@socketio.on('cur_drone_gps')
def cur_drone_gps(response):
    print('cur_drone_gps')
    print(response)
    emit('cur_drone_gps', response, broadcast=True)


@socketio.on('drone_settings')
def drone_settings(response):
    print('drone_settings')
    print(response)
    emit('drone_settings', response, broadcast=True)


@app.route('/chat')
def chat():
    return render_template('tests/chat.html')


@app.route('/admin')
def index():
    return render_template('tests/test.html')


@app.route('/')
@cross_origin()
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
