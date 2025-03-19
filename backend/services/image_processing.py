import cv2
import numpy as np
from PIL import Image
import os
from config import PROCESSED_FOLDER

def process_image(file, filename):

    img = Image.open(file).convert("RGBA")
    img_np = np.array(img)


    alpha_channel = img_np[:, :, 3]
    img_rgb = img_np[:, :, :3]

    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    _, img_bw = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY)

    edges = cv2.Canny(img_bw, 100, 200)


    kernel = np.ones((10, 10), np.uint8)
    thick_edges = cv2.dilate(edges, kernel, iterations=3)


    contours, _ = cv2.findContours(thick_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)


    h, w = img_np.shape[:2]
    outline = np.zeros((h, w, 4), dtype=np.uint8)

    cv2.drawContours(outline, contours, -1, (0, 0, 0, 255), thickness=10)

    original_webp_filename = os.path.splitext(filename)[0] + '_original.webp'
    original_processed_path = os.path.join(PROCESSED_FOLDER, original_webp_filename)
    img.save(original_processed_path, format='WEBP')


    final_image_pil = Image.fromarray(outline, 'RGBA')
    outlines_webp_filename = os.path.splitext(filename)[0] + '_outlines.webp'
    outlines_processed_path = os.path.join(PROCESSED_FOLDER, outlines_webp_filename)
    final_image_pil.save(outlines_processed_path, format='WEBP')

    return original_processed_path, outlines_processed_path
