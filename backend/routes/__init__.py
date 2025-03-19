from flask import Blueprint
from .image_routes import image_routes

def create_routes(app):
    app.register_blueprint(image_routes)