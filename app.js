var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { DBHOST, DBPORT, DBNAME } = require('./config/config');
const indexRouter = require('./routes/web/index');
const authRouter = require('./routes/web/auth');
const authApiRouter = require('./routes/api/auth');
//導入 account api 路由文件
const accountRouter = require('./routes/api/account');
//導入 Socket.IO
const http = require('http');
const { Server } = require('socket.io');


const app = express();

//設定 session 的中間鍵
app.use(session({
    name: 'sid', //設定 cookie 的 name，預設是: connect.sid
    secret: 'aiml05_02', // 簽名
    saveUninitialized: false, // 是否在每次請求時都設定一個 cookie 儲存 session id
    resave: true, //在每次請求後重新保存 session
    store: MongoStore.create({
        mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}` //資料庫的連接
    }),
    cookie: {
        httpOnly: true, //開啟後前端不能透過 JS 操作
        maxAge: 1000 * 60 * 60 * 24 * 7 //控制 session 過期的時間
    },
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // 首頁及功能
app.use('/', authRouter); // 註冊頁面及功能
app.use('/api', accountRouter);
app.use('/api', authApiRouter);

// 創建 HTTP 伺服器
const server = http.createServer(app);

// 創建 Socket 伺服器
const io = new Server(server);

// Socket 處理
io.on('connection', (socket) => {
    console.log('Socket client connected');
    socket.on('stream', (data) => {
        try {
            // 進行處理或傳遞數據
            io.emit('stream', data);
        } finally {
            // 顯式釋放變量
            data = null;
        }
    });
    socket.on('disconnect', () => {
        console.log('Socket client disconnected');
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    //回應 404
    res.render('404');
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = { app, server }; // 導出 app 和 server
