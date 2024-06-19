const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
//導入 moment
const moment = require('moment');

//宣告登入檢測的 middleware
let checkLoginMiddleware = require('../../middleware/checkLoginMiddleware');
const MemberModel = require('../../models/MemberModel');

let faceRecognitionProcess = null;
let fallDetectionProcess = null;
let fireAlarmProcess = null;

// 系統首頁
router.get('/', checkLoginMiddleware, function(req, res, next) {
  res.redirect('/homepage');
});
// 系統首頁
router.get('/homepage', checkLoginMiddleware, function(req, res, next) {
  res.render('homePage');
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
        const pythonProcess = spawn('python', ['models/Face_Recognition/Face_Recognition.py']);
    
        // 監聽輸出事件（如果需要）
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python 輸出： ${data}`);
        });
    
        // 監聽錯誤事件（如果需要）
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python 錯誤： ${data}`);
        });
    
        // 監聽結束事件（如果需要）
        pythonProcess.on('close', (code) => {
            console.log(`Python 子進程結束，退出碼 ${code}`);
        });
  res.render('faceRecognition');
});

//新增室內動作監控頁面
router.get('/homepage/fallDetection', checkLoginMiddleware, function(req, res, next) {
        // 執行 Python 腳本
        const pythonProcess = spawn('python', ['models/Fall_Detection/YOLOv8_fall.py']);
    
        // 監聽輸出事件（如果需要）
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Python 輸出： ${data}`);
        });
    
        // 監聽錯誤事件（如果需要）
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python 錯誤： ${data}`);
        });
    
        // 監聽結束事件（如果需要）
        pythonProcess.on('close', (code) => {
            console.log(`Python 子進程結束，退出碼 ${code}`);
        });
  res.render('fallDetection');
});

//新增火災警報通知頁面
router.get('/homepage/fireAlarm', checkLoginMiddleware, function(req, res, next) {
      // 執行 Python 腳本
      const pythonProcess = spawn('python', ['models/Fire_Alarm/fire.py']);
    
      // 監聽輸出事件（如果需要）
      pythonProcess.stdout.on('data', (data) => {
          console.log(`Python 輸出： ${data}`);
      });
  
      // 監聽錯誤事件（如果需要）
      pythonProcess.stderr.on('data', (data) => {
          console.error(`Python 錯誤： ${data}`);
      });
  
      // 監聽結束事件（如果需要）
      pythonProcess.on('close', (code) => {
          console.log(`Python 子進程結束，退出碼 ${code}`);
      });
  res.render('fireAlarm');
});

// 新增紀錄
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

//刪除記帳紀錄
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

// 新增關閉子進程的路由
router.post('/homepage/close-python', function(req, res) {
  if (faceRecognitionProcess) {
    faceRecognitionProcess.kill();
    faceRecognitionProcess = null;
  }
  if (fallDetectionProcess) {
    fallDetectionProcess.kill();
    fallDetectionProcess = null;
  }
  if (fireAlarmProcess) {
    fireAlarmProcess.kill();
    fireAlarmProcess = null;
  }
  res.send({ message: '子進程已關閉' });
});

module.exports = router;
