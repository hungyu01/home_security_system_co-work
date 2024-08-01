
<h1 align="center">
  Home Security System
  <br>
  居家智慧監控系統
</h1>

<h4 align="center">具有人臉辨識、跌倒偵測、火焰偵測系統的居家監控系統的網站，且包含了 Gmail 的告警功能與留言板功能
<br>
A home security website featuring face recognition, fall detection, and fire detection systems, including Gmail alert and a message board.  
<img src="https://github.com/hungyu01/home_security_system_co-work/blob/main/public/example.png" alt="Home_Security_System" width: 200px>
</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#download">Download</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## Key Features

* Face Recognition 人臉辨識
  - 以 OpenCV 訓練的人臉辨識模型
* Fall Detection 跌倒偵測
  - 以 YOLOv8 訓練的跌倒偵測模型
* Fire Detection 火焰偵測
  - 以 YOLOv8 訓練的火焰偵測模型
* Gmail SMTP Alert Gmail 告警系統
* Message Board 留言板
  - 基於 MongoDB 的留言板功能
* Directory 通訊錄
  - 基於 MongoDB 的通訊錄功能
* Cross platform 跨平台
  - Windows, macOS and Linux ready.
  - 在 Windows, macOS and Linux 皆可使用

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) , [Python@3.9.19](https://www.python.org/downloads/),[Node.js@21.7.3](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) and [MongoDB Community Server@6.0.16](https://www.mongodb.com/try/download/community) installed on your computer. From your command line:
<br>
要複製並執行此應用程序，需要在電腦上安裝 Git 、 Node.js@21.7.3（與 npm 一起提供）、Python@3.9.19 和 MongoDB Community Server@6.0.16：

```bash
# Clone this repository
$ git clone https://github.com/hungyu01/home_security_system_co-work

# Install dependencies
$ npm install

# Run the app
$ npm start
```


## Download

You can [download](https://github.com/hungyu01/home_security_system_co-work) the latest installable version of home security system for Windows, macOS and Linux.

## Credits

This software uses the following open source packages:

- [Python@3.9.19](https://www.python.org/downloads/)
- [Node.js@21.7.3](https://nodejs.org/)
- [MongoDB Community Server@6.0.16](https://www.mongodb.com/try/download/community)
- [Socket.IO](https://socket.io/)
- [Express](https://expressjs.com/)

## License

MIT
