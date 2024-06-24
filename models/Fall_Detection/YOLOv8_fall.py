import numpy as np
import cv2
from ultralytics import YOLO
import socketio
import base64
import shutil
import time
import importlib.util

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
sio.connect('http://192.168.24.51:4000')  # 記得確認 ip 和 port

# 目前路徑
runs_folder_path = './runs'                               # 輸出的資料夾路徑
results_path = runs_folder_path + '/detect/predict/image0.jpg'                     # 這一行路徑不用改
model_path = './models/Fall_Detection/best.pt' # Fall 模型的路徑

cap = cv2.VideoCapture('./public/video/Fall_2.mp4')

# 降低畫素以加速模型運算 (if needed)
# try 640*480 or 320*240
'''
desired_width = 640
desired_height = 480
cap.set(cv2.CAP_PROP_FRAME_WIDTH, desired_width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, desired_height)
#'''

model = YOLO('./models/Fall_Detection/best.pt') # 要改model路徑

# send messages
fall_count = 0
warning_threshold = 10

try:
    while cap.isOpened() and running: 
        ret, frame = cap.read()
        if not ret or cv2.waitKey(30) == 27: break

        results = model(source=frame, show=False, conf=0.4, save=True)
        
        img = cv2.imread('./runs/detect/predict/image0.jpg') # 讀取圖片路徑 ('predict'可能需要改)
        
        # Warning Alarm preparation
        try:
            for r in results:
                if 1 in r.boxes.cls:   # falling
                    fall_count += 1
                elif 0 in r.boxes.cls: # fallen
                    fall_count += 1
        except RuntimeError: 
            fall_count = 0             # clear
        
        # send message once
        if fall_count == warning_threshold:  
            print('sending warning message')

            # 抓取當前偵測事件的截圖
            screenshot_path = './public/picture/fall_event/fire_screenshot.jpg'
            cv2.imwrite(screenshot_path, frame)

            send_mail()

        _, buffer = cv2.imencode('.jpg', img)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # 發送影像幀到伺服器
        sio.emit('streamFall', jpg_as_text)

        # 設置每一幀之間的延遲
        time.sleep(0.1)

finally:
    # 使用 shutil 的 rmtree 刪除輸出資料夾
    try:
        shutil.rmtree(runs_folder_path)
        print(f"成功刪除資料夾 {runs_folder_path}")
    except OSError as e: 
        print(f"Error: {runs_folder_path} : {e.strerror}")

    cap.release()
    cv2.destroyAllWindows()
    cv2.waitKey(1)
    sio.disconnect()
