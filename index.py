from flask import *
from markupsafe import escape

app = Flask(__name__)
app.run(debug=True)


@app.route('/')
def index():
    return render_template('tests/test.html')


@app.route('/admin')
def admin():
    return render_template('tests/adminLTE.html')


@app.route('/login')
def login():
    return 'login'


@app.route('/user/<username>')
def profile(username):
    return f'{username}\'s profile'


with app.test_request_context():
    print(url_for('index'))
    print(url_for('login'))
    print(url_for('login', next='/'))
    print(url_for('profile', username='John Doe'))
