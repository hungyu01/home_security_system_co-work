from ultralytics import YOLO
import cvzone
import cv2
import math
import socketio
import base64

# 初始化 Socket.IO 連接
sio = socketio.Client()

# 連接到伺服器
sio.connect('http://192.168.24.51:4000')  # 確認 IP 和 port

# 啟動攝像頭
cap = cv2.VideoCapture(0) 
model = YOLO('./models/Fire_Alarm/fire.pt')

# 類別名稱
classnames = ['fire']

while True:
    ret, frame = cap.read()
    
    if not ret:
        print("影格捕獲失敗，跳過這個迴圈")
        continue  # 如果影格捕獲失敗，則跳過這個迴圈
    
    frame = cv2.resize(frame, (640, 480))
    result = model(frame, stream=True)

    # 獲取邊界框、置信度和類別名稱的信息
    for info in result:
        boxes = info.boxes
        for box in boxes:
            confidence = box.conf[0]
            confidence = math.ceil(confidence * 100)
            Class = int(box.cls[0])
            if confidence > 80:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 5)
                cvzone.putTextRect(frame, f'{classnames[Class]} {confidence}%', [x1 + 8, y1 + 100], scale=1.5, thickness=2)

    # 左右翻轉影像幀
    # frame = cv2.flip(frame, 1)   
    # 將影像幀轉換成 base64 字符串
    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')

    # 發送影像幀到伺服器
    sio.emit('streamFire', jpg_as_text)

    # 顯示影像幀
    cv2.imshow('frame', frame)
    
    # 檢查是否按下 'q' 鍵退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 釋放資源
cap.release()
cv2.destroyAllWindows()
