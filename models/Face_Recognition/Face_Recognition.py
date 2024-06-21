import cv2
import socketio
import base64

recognizer = cv2.face.LBPHFaceRecognizer_create()         # 啟用訓練人臉模型方法
recognizer.read('./models/Face_Recognition/face.yml')                               # 讀取人臉模型檔
cascade_path = "./models/Face_Recognition/xml/haarcascade_frontalface_default.xml"  # 載入人臉追蹤模型
face_cascade = cv2.CascadeClassifier(cascade_path)        # 啟用人臉追蹤
cap = cv2.VideoCapture(0)                                 # 開啟攝影機

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
sio.connect('http://192.168.24.51:4000')  # 記得替換 ip 和 port

if not cap.isOpened():
    print("Cannot open camera")
    exit()
while True:
    ret, img = cap.read()
    if not ret:
        print("Cannot receive frame")
        break
    img = cv2.resize(img,(800,500))              # 縮小尺寸，加快辨識效率
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)  # 轉換成黑白
    faces = face_cascade.detectMultiScale(gray)  # 追蹤人臉 ( 目的在於標記出外框 )

    # 建立姓名和 id 的對照表
    name = {
        '4':'SJ',
        '2':'Mark Ruffalo',
    }

    # 依序判斷每張臉屬於哪個 id
    for(x,y,w,h) in faces:
        cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)            # 標記人臉外框
        idnum,confidence = recognizer.predict(gray[y:y+h,x:x+w])  # 取出 id 號碼以及信心指數 confidence
        if confidence < 60:
            text = name[str(idnum)]                               # 如果信心指數小於 60，取得對應的名字
        else:
            text = '???'                                          # 不然名字就是 ???
        # 在人臉外框旁加上名字
        cv2.putText(img, text, (x,y-5),cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2, cv2.LINE_AA)
        # 將影像幀轉換成 base64 字符串
        _, buffer = cv2.imencode('.jpg', img)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')

        # 發送影像幀到伺服器
        sio.emit('streamFace', jpg_as_text)

if not sio.connected:
    exit()

cap.release()
cv2.destroyAllWindows()
sio.disconnect()