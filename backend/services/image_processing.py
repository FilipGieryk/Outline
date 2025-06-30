def process_image(file, filename):
    import cv2
    import numpy as np
    from PIL import Image
    import os
    from config import PROCESSED_FOLDER

    img = Image.open(file).convert("RGBA")
    img_np = np.array(img)

    img_rgb = img_np[:, :, :3]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Blur to reduce internal detail/noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # 2. Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)

    # 3. Morph closing to connect broken lines
    kernel = np.ones((3, 3), np.uint8)
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

    # 4. Find detailed contours
    contours, _ = cv2.findContours(closed, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)

    # 5. Filter small contours (noise)
    filtered_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > 100] # adjust 500 as needed

    # 6. Optionally smooth the remaining contours
    smoothed = []
    for cnt in filtered_contours:
        epsilon = 0.0007 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        smoothed.append(approx)

    # 7. Create the outline image
    h, w = img_np.shape[:2]
    outline = np.zeros((h, w, 4), dtype=np.uint8)
    cv2.drawContours(outline, smoothed, -1, (0, 0, 0, 255), thickness=1)

    # Save original
    original_webp_filename = os.path.splitext(filename)[0] + '_original.webp'
    original_processed_path = os.path.join(PROCESSED_FOLDER, original_webp_filename)
    img.save(original_processed_path, format='WEBP')

    # Save outline
    final_image_pil = Image.fromarray(outline, 'RGBA')
    outlines_webp_filename = os.path.splitext(filename)[0] + '_outlines.webp'
    outlines_processed_path = os.path.join(PROCESSED_FOLDER, outlines_webp_filename)
    final_image_pil.save(outlines_processed_path, format='WEBP')

    return original_processed_path, outlines_processed_path
