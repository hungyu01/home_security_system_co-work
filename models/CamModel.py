# -*- coding: utf-8 -*-
import cv2
import socketio
import base64

# 初始化 Socket.IO 連接
sio = socketio.Client()

# 連接到伺服器
sio.connect('http://192.168.24.51:4000')  # 記得替換 ip 和 port

# 初始化攝影機
cap = cv2.VideoCapture(0)

fps = cap.get(cv2.CAP_PROP_FPS)               # 每秒幀數
F_Count = cap.get(cv2.CAP_PROP_FRAME_COUNT)   # 總共的幀數
print('fps : {:.2f} f/s, Frame_Count : {}'.format(fps, F_Count))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret or cv2.waitKey(1) == 27:  # 按下 ESC 退出
        break

    # 左右翻轉影像幀
    frame = cv2.flip(frame, 1)   

    # 將影像幀轉換成 base64 字符串
    _, buffer = cv2.imencode('.jpg', frame)
    jpg_as_text = base64.b64encode(buffer).decode('utf-8')

    # 發送影像幀到伺服器
    sio.emit('streamFace', jpg_as_text)

# 攝影機 release、destory
cap.release()
cv2.destroyAllWindows()
cv2.waitKey(1)