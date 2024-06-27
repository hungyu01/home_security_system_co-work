const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
//導入 moment
const moment = require('moment');

//宣告登入檢測的 middleware
let checkLoginMiddleware = require('../../middleware/checkLoginMiddleware');
const MemberModel = require('../../models/MemberModel');
const treeKill = require('tree-kill');
const ChatModel = require('../../models/ChatModel')

let faceRecognitionProcess = null;
let fallDetectionProcess = null;
let fireAlarmProcess = null;

// 系統首頁
router.get('/', checkLoginMiddleware, function(req, res, next) {
  res.redirect('/homepage');
});
// 系統首頁
router.get('/homepage', checkLoginMiddleware, async function(req, res, next) {
  let chats  = await ChatModel.find().sort({ time: -1 }).exec();
  res.render('homePage', { chats: chats, moment: moment });
});

// 新增留言頁面
router.get('/homepage/chat', checkLoginMiddleware, function(req, res, next) {
  res.render('chat');
});

// 顯示名單紀錄
router.post("/homepage", checkLoginMiddleware, async (req, res) => {
  try {
    // 將日期轉成 Date 類型
    let chat = new ChatModel({
      ...req.body,
      time: moment(req.body.time).toDate()
    });
    // 儲存到資料庫中
    await chat.save();
    // 成功後重定向
    res.render('success', { msg: '新增成功', url: '/homepage' });
  } catch (error) {
    res.status(500).send('插入失敗');
  }
});

//刪除留言紀錄
router.get('/homepage/:id', checkLoginMiddleware, async (req, res) => {
  try {
    // 獲得 params 的 id 參數
    let id = req.params.id;

    // 刪除記錄
    await ChatModel.findByIdAndDelete(id);

    // 提醒
    res.render('success', { msg: '刪除成功', url: '/homepage' });
  } catch (error) {
    res.status(500).send('刪除失敗');
  }
});

//新增來賓名單頁面
router.get('/homepage/member', checkLoginMiddleware, async function(req, res, next) {
  try {
    // 從資料庫中讀取所有的帳單訊息，按時間降序排列
    let members = await MemberModel.find().sort({ time: -1 }).exec();
    res.render('member', { members: members, moment: moment });
  } catch (error) {
    res.status(500).send('讀取失敗！');
  }
});

//新增來賓名單頁面
router.get('/homepage/member/create', checkLoginMiddleware, function(req, res, next) {
  res.render('create');
});

//新增大門人臉偵測頁面
router.get('/homepage/faceRecognition', checkLoginMiddleware, function(req, res, next) {
        // 執行 Python 腳本
        faceRecognitionProcess = spawn('python', ['models/Face_Recognition/Face_Recognition.py']);
    
        // 監聽輸出事件（如果需要）
        faceRecognitionProcess.stdout.on('data', (data) => {
            console.log(`Python 輸出： ${data}`);
        });
    
        // 監聽錯誤事件（如果需要）
        faceRecognitionProcess.stderr.on('data', (data) => {
            console.error(`Python 錯誤： ${data}`);
        });
    
        // 監聽結束事件（如果需要）
        faceRecognitionProcess.on('close', (code) => {
            console.log(`Python 子進程結束，退出碼 ${code}`);
        });
  res.render('faceRecognition');
});

// 停止人臉偵測的 Python 腳本
router.post('/homepage/stopFaceRecognition', (req, res) => {
  if (faceRecognitionProcess) {
    treeKill(faceRecognitionProcess.pid, 'SIGTERM');
    faceRecognitionProcess = null;
    res.send('Face recognition stopped');
  } else {
    res.send('No face recognition process to stop');
  }
});

//新增室內動作監控頁面
router.get('/homepage/fallDetection', checkLoginMiddleware, function(req, res, next) {
        // 執行 Python 腳本
        fallDetectionProcess = spawn('python', ['models/Fall_Detection/YOLOv8_fall.py']);
    
        // 監聽輸出事件（如果需要）
        fallDetectionProcess.stdout.on('data', (data) => {
            console.log(`Python 輸出： ${data}`);
        });
    
        // 監聽錯誤事件（如果需要）
        fallDetectionProcess.stderr.on('data', (data) => {
            console.error(`Python 錯誤： ${data}`);
        });
    
        // 監聽結束事件（如果需要）
        fallDetectionProcess.on('close', (code) => {
            console.log(`Python 子進程結束，退出碼 ${code}`);
        });
  res.render('fallDetection');
});

// 停止動作監控的 Python 腳本
router.post('/homepage/stopFallDetection', (req, res) => {
  if (fallDetectionProcess) {
    treeKill(fallDetectionProcess.pid, 'SIGTERM');
    fallDetectionProcess = null;
    res.send('Fall detection stopped');
  } else {
    res.send('No fall detection process to stop');
  }
});

//新增火災警報通知頁面
router.get('/homepage/fireAlarm', checkLoginMiddleware, function(req, res, next) {
      // 執行 Python 腳本
      fireAlarmProcess = spawn('python', ['models/Fire_Alarm/fire.py']);
    
      // 監聽輸出事件（如果需要）
      fireAlarmProcess.stdout.on('data', (data) => {
          console.log(`Python 輸出： ${data}`);
      });
  
      // 監聽錯誤事件（如果需要）
      fireAlarmProcess.stderr.on('data', (data) => {
          console.error(`Python 錯誤： ${data}`);
      });
  
      // 監聽結束事件（如果需要）
      fireAlarmProcess.on('close', (code) => {
          console.log(`Python 子進程結束，退出碼 ${code}`);
      });
  res.render('fireAlarm');
});

// 停止火災警報的 Python 腳本
router.post('/homepage/stopFireAlarm', (req, res) => {
  if (fireAlarmProcess) {
    treeKill(fireAlarmProcess.pid, 'SIGTERM');
    fireAlarmProcess = null;
    res.send('Fire alarm stopped');
  } else {
    res.send('No fire alarm process to stop');
  }
});

// 顯示名單紀錄
router.post("/homepage/member", checkLoginMiddleware, async (req, res) => {
  try {
    // 將日期轉成 Date 類型
    let member = new MemberModel({
      ...req.body,
      time: moment(req.body.time).toDate()
    });
    // 儲存到資料庫中
    await member.save();
    // 成功後重定向
    res.render('success', { msg: '新增成功', url: '/homepage/member' });
  } catch (error) {
    res.status(500).send('插入失敗');
  }
});

//刪除名單紀錄
router.get('/homepage/member/:id', checkLoginMiddleware, async (req, res) => {
  try {
    // 獲得 params 的 id 參數
    let id = req.params.id;

    // 刪除記錄
    await MemberModel.findByIdAndDelete(id);

    // 提醒
    res.render('success', { msg: '刪除成功', url: '/homepage/member' });
  } catch (error) {
    res.status(500).send('刪除失敗');
  }
});

module.exports = router;
