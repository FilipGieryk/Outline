from flask import Flask, jsonify
from routes import create_routes
app = Flask(__name__)

create_routes(app)


if __name__ == '__main__':
    app.run(debug=True, port=5000)