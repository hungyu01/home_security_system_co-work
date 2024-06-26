var express = require('express');
var router = express.Router();
// 導入 jwt
const jwt = require('jsonwebtoken');
// 導入 UserModel 模型
const UserModel = require('../../models/UserModel');
// 導入 md5 加密密碼
const md5 = require('md5');

// 登入的操作
router.post('/login', async (req, res) => {
    // 取得用戶名跟密碼
    let { username, password } = req.body;

    try {
        // 查詢資料庫密碼
        const user = await UserModel.findOne({ username: username, password: md5(password) });
        if (user) {
            // 創建 token
            let token = jwt.sign({
                username: user.username,
                _id: user._id
            }, 'password', {
                expiresIn: 60 * 60 * 24 * 7
            });
            req.session.username = user.username;
            req.session._id = user._id;
            res.json({
                code: '0000',
                msg: '資料庫讀取成功',
                data: token
            });
        } else {
            res.status(401).json({
                code: '2001',
                msg: '帳號或密碼錯誤，請稍後再試',
                data: null
            });
            return;  // 添加 return 函數發送請求後退出
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            code: '2002',
            msg: '資料庫讀取失敗',
            data: null
        });
        return; // 添加 return 函數發送請求後退出
    }
});

// 退出登入
router.post('/logout', (req, res) => {
    // destory session
    req.session.destroy(() => {
        res.render('success', { msg: '您已登出', url: '/login' });
    });
});

module.exports = router;
