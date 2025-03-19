from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
import os
from services.image_processing import process_image
from config import UPLOAD_FOLDER
import base64

image_routes = Blueprint("image_routes", __name__)
CORS(image_routes)

@image_routes.route("/upload", methods=["POST"])
def upload_file():
    if "files" not in request.files:
        return jsonify({"error": "No file part"}), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No selected files"}), 400

    processed_images = []

    for file in files:
        if file.filename == "":
            return jsonify({"error": "One or more files have no filename"}), 400

        original_processed_path, outlines_processed_path = process_image(file, file.filename)

        with open(original_processed_path, "rb") as img_file:
            encoded_original_string = base64.b64encode(img_file.read()).decode('utf-8')

        with open(outlines_processed_path, "rb") as img_file:
            encoded_outlines_string = base64.b64encode(img_file.read()).decode('utf-8')

        processed_images.append([
        f"data:image/webp;base64,{encoded_original_string}",
        f"data:image/webp;base64,{encoded_outlines_string}"
        ])

    return jsonify({"processed_images": processed_images}), 200