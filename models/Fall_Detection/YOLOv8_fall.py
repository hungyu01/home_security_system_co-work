import numpy as np
import cv2
import time
from ultralytics import YOLO
import tensorflow as tf
import socketio
import base64

sio = socketio.Client()
sio.connect('http://192.168.24.51:4000')

cap = cv2.VideoCapture(0)

model = YOLO('./models/Fall_Detection/best.pt')


while cap.isOpened(): 
    ret, frame = cap.read()
    if not ret or cv2.waitKey(30) == 27: break

    results = model(source=0, conf=0.4, save=True) # 一幀一幀算(img)
    
    # # View results
    # try:
    #     for r in results:
    #         if r.boxes.cls == 1: # falling
    #             print ("Warning:someone's falling")
    #         if r.boxes.cls == 0: # fallen
    #             print ("Warning:someone's fallen")
    # except RuntimeError: pass

    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')

    sio.emit('streamFall', jpg_as_text)

        
cap.release()
# out.release()
cv2.destroyAllWindows()
cv2.waitKey(1)
