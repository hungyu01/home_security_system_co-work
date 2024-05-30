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
//导入 account api 路由文件
const accountRouter = require('./routes/api/account');
//导入 Socket.IO
const http = require('http');
const { Server } = require('socket.io');

const app = express();

//设置 session 的中间件
app.use(session({
    name: 'sid', //设置 cookie 的 name，默认是: connect.sid
    secret: 'aiml05_02', //参与加密的字符串(又称为签名)
    saveUninitialized: false, //是否在每次请求时都设置一个 cookie 储存 session id
    resave: true, //在每次请求后重新保存 session
    store: MongoStore.create({
        mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}` //数据库的连接
    }),
    cookie: {
        httpOnly: true, //开启后前端无法通过 JS 操作
        maxAge: 1000 * 60 * 60 * 24 * 7 //控制 session 过期的时间
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

app.use('/', indexRouter); //首页及功能页面
app.use('/', authRouter); //注册功能页面
app.use('/api', accountRouter);
app.use('/api', authApiRouter);

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 Socket.IO 服务器
const io = new Server(server);

// WebSocket 处理
io.on('connection', (socket) => {
    console.log('WebSocket client connected');
    socket.on('stream', (data) => {
        io.emit('stream', data);
    });
    socket.on('disconnect', () => {
        console.log('WebSocket client disconnected');
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    //响应404
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

module.exports = { app, server }; // 导出 app 和 server
