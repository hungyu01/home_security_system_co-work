import cv2
from ultralytics import YOLO
import socketio
import base64
import math
import time
import importlib.util
from pymongo import MongoClient

# MongoDB 連接設置
client = MongoClient('mongodb://localhost:27017/')  # 根據需要調整連接參數
db = client['housekeeper']  # 選擇數據庫
collection = db['events']  # 選擇集合

#from mail.content_fall import send_mail
# Construct the full path to module2.py
module2_path = './models/mail/content_fall.py'  # Adjust the path accordingly
module2_name = 'module2'

# Importing a specific function dynamically
spec = importlib.util.spec_from_file_location(module2_name, module2_path)
module2 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module2)

# Access the specific function
send_mail = getattr(module2, 'send_mail')

# 初始化 Socket.IO 連接
sio = socketio.Client()

# 控制主循環運行的標誌
running = True

# 定義斷開連接的處理函數
def disconnect_handler():
    global running
    print("與伺服器斷開連接。停止應用程序。")
    running = False

# 註冊斷開連接事件的處理函數
sio.on('disconnect', disconnect_handler)

# 連接到伺服器
sio.connect('http://127.0.0.1:4000')  # 記得確認 ip 和 port

cap = cv2.VideoCapture('./public/video/Fall.mp4')
if not cap.isOpened():
    print("無法打開攝像頭")
    exit()
# 目前路徑
model = YOLO('./models/Fall_Detection/best.pt') # 要改model路徑

# Reading the classes
classnames = ['fallen', 'falling', 'standing']  # Update with all classes your model detects

# send messages
fall_count = 0
warning_threshold = 10

font = cv2.FONT_HERSHEY_SIMPLEX
lt = 2

try:
    while running:
        ret, frame = cap.read()
        if not ret:
            print("影格捕獲失敗，跳過這個迴圈")
            continue

        result = model(frame, stream=True)

        # Getting bbox, confidence and class names information to work with
        for info in result:
            boxes = info.boxes
            for box in boxes:
                confidence = box.conf[0]
                confidence = math.ceil(confidence * 100)
                Class = int(box.cls[0])
                if confidence > 0.4 and classnames[Class] in ['fallen', 'falling', 'standing']:
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    if classnames[Class] == 'fallen':
                        color = (0, 0, 255)  # Red color for fallen
                        fall_count += 1  # Increment fire_count when fire is detected
                        
                    elif classnames[Class] == 'falling':
                        color = (255, 165, 0)  # Orange color for falling
                        fall_count += 1  # Increment fire_count when fire is detected
                    else:
                        color = (0, 255, 0)  # Green color for standing

                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                    cv2.putText(frame, f'{classnames[Class]} {confidence}%', (x1 + 8, y1 + 25),
                                font, 0.8, color, lt)

        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # 發送影像幀到伺服器
        sio.emit('streamFall', jpg_as_text)

        # 設置每一幀之間的延遲
        time.sleep(0.1)

        if fall_count == warning_threshold:
            print("Fall detected in more than 10 frames! Triggering alarm.")
            # Here you can add code to trigger an alarm (e.g., play a sound, send a notification)

            # 抓取當前偵測事件的截圖
            screenshot_path = './public/picture/fall_event/fall_screenshot.jpg'
            cv2.imwrite(screenshot_path, frame)

            # Here you can add code to trigger an alarm (e.g., play a sound, send a notification)
            # fire_count = 0  # Reset fire_count after triggering the alarm
            send_mail()

            # 紀錄事件到 MongoDB
            event = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'event_type': '動作偵測',
                'details': '偵測到跌倒動作，請開啟監控系統確認'
            }
            collection.insert_one(event)

finally:
    cap.release()
    cv2.destroyAllWindows()
    cv2.waitKey(1)
    sio.disconnect()
