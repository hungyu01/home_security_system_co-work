import numpy as np
import cv2
from ultralytics import YOLO
import socketio
import base64

# 初始化 Socket.IO 連接
sio = socketio.Client()

# 連接到伺服器
sio.connect('http://192.168.24.51:4000')  # 記得確認 ip 和 port
cap = cv2.VideoCapture(0)

model = YOLO('./models/Fall_Detection/best.pt') # 要改model路徑

while cap.isOpened(): 
    ret, frame = cap.read()
    if not ret or cv2.waitKey(30) == 27: break

    results = model(source=frame, show=True, conf=0.4, save=True)
    img = cv2.imread('./runs/detect/predict16/image0.jpg') # 讀取圖片路徑 ('predict'可能需要改)
    _, buffer = cv2.imencode('.jpg', img)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')

    # 發送影像幀到伺服器
    sio.emit('streamFall', jpg_as_text)

cap.release()
cv2.destroyAllWindows()
cv2.waitKey(1)