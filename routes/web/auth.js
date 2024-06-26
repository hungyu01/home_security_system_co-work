import { Router } from 'express';
var router = Router();
//導入 UserModel 模型
import { create, findOne } from '../../models/UserModel';
//導入 md5 加密密碼
import md5 from 'md5';

//註冊頁面
router.get('/reg', (req, res)=>{
    //回應html內容
    res.render('auth/reg');
});

//註冊內容
router.post('/reg', async (req, res) => {
    //讀取請求的數據，並使用 md5 對密碼進行加密
    const hashedPassword = md5(req.body.password);
    
    // 創建使用者資料並儲存到資料庫
    try {
        const data = await create({ ...req.body, password: hashedPassword });
        res.render('success', { msg: '註冊成功', url: '/login' });
    } catch (err) {
        console.error(err);
        res.status(500).send('註冊失敗，請稍後再試');
    }
});

//登入頁面
router.get('/login', (req, res)=>{
    //回應html內容
    res.render('auth/login');
});

// 登入的操作
router.post('/login', async (req, res) => {
    // 取得用戶名跟密碼
    let { username, password } = req.body;
        // 查詢資料庫密碼
        const user = await findOne({ username: username, password: md5(password) });
        if (user) {
            req.session.username = user.username;
            req.session._id = user._id;
            res.render('success', { msg: '登入成功', url: '/homepage' });
        } else {
            res.render('error');
        }
});

//退出登入
router.post('/logout', (req, res)=>{
    // destory session
    req.session.destroy(()=>{
        res.render('success', {msg:'您已登出', url:'/login'})
    });
});


export default router;
