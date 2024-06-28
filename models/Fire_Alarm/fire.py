from ultralytics import YOLO
import cv2
import math
import socketio
import base64
import time  # 新增導入time模組
import importlib.util
from pymongo import MongoClient

# MongoDB 連接設置
client = MongoClient('mongodb://localhost:27017/')  # 根據需要調整連接參數
db = client['housekeeper']  # 選擇數據庫
collection = db['events']  # 選擇集合

#from mail.content_fall import send_mail
# Construct the full path to module2.py
module2_path = './models/mail/content_fire.py'  # Adjust the path accordingly
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
sio.connect('http://192.168.24.51:4000')  # 確認 IP 和 port

# 啟動攝像頭
cap = cv2.VideoCapture('./public/video/Fire_0.mp4')
if not cap.isOpened():
    print("無法打開攝像頭")
    exit()

model = YOLO('./models/Fire_Alarm/fire.pt')

# 類別名稱
classnames = ['fire', 'smoke', 'other']  # Update with all classes your model detects

fire_count = 0

try:
    while running:
        ret, frame = cap.read()
        if not ret:
            print("影格捕獲失敗，跳過這個迴圈")
            continue
        
        # frame = cv2.resize(frame, (640, 480))
        result = model(frame, stream=True)

        # 獲取邊界框、置信度和類別名稱的信息
        for info in result:
            boxes = info.boxes
            for box in boxes:
                confidence = box.conf[0]
                confidence = math.ceil(confidence * 100)
                Class = int(box.cls[0])
                if confidence > 50 and classnames[Class] in ['fire', 'smoke', 'other']:
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    if classnames[Class] == 'fire':
                        color = (0, 0, 255)  # Red color for fire
                    elif classnames[Class] == 'smoke':
                        color = (255, 0, 0)  # Blue color for smoke
                    else:
                        color = (0, 255, 0)  # Green color for other

                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 5)
                    cv2.putText(frame, f'{classnames[Class]} {confidence}%', (x1 + 8, y1 + 30),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                    if classnames[Class] == 'fire':
                        fire_count += 1  # Increment fire_count when fire is detected

        # 將影像幀轉換成 base64 字符串
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # 發送影像幀到伺服器
        sio.emit('streamFire', jpg_as_text)

        # 設置每一幀之間的延遲
        time.sleep(0.1)

        if fire_count == 10:
            print("Fire detected in more than 10 frames! Triggering alarm.")

            # 抓取當前偵測事件的截圖
            screenshot_path = './public/picture/fire_event/fire_screenshot.jpg'
            cv2.imwrite(screenshot_path, frame)

            # Here you can add code to trigger an alarm (e.g., play a sound, send a notification)
            # fire_count = 0  # Reset fire_count after triggering the alarm
            send_mail()

            # 紀錄事件到 MongoDB
            event = {
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'event_type': '火災警報',
                'details': '偵測到火災，請開啟監控系統確認'
            }
            collection.insert_one(event)

finally:
    # 釋放資源
    cap.release()
    cv2.destroyAllWindows()
    sio.disconnect()
