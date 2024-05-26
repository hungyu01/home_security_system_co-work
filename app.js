var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const {DBHOST, DBPORT, DBNAME} = require('./config/config');
const indexRouter = require('./routes/web/index');
const authRouter = require('./routes/web/auth');
const authApiRouter = require('./routes/api/auth')
//導入 account api 路由文件
const accountRouter = require('./routes/api/account');



const app = express();

//設定 session 的中間件
app.use(session({
  name: 'sid', //設定 cookie 的 name，預設是: connect.sid
  secret: 'aiml05_02', //參與加密的字符串(又稱為簽名)
  saveUninitialized: false, //是否在每次請求時都設定一個 cookie 儲存 session id
  resave: true, //在每次請求後重新保存 session
  store: MongoStore.create({
      mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}` //資料庫的連接
  }),
  cookie:{
      httpOnly:true, //開啟後前端無法透過 JS 操作
      maxAge: 1000*60*60*24*7 //控制 session 過期的時間
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

app.use('/', indexRouter); //首頁及功能頁面
app.use('/', authRouter); //註冊功能頁面
app.use('/api', accountRouter); 
app.use('/api', authApiRouter); 


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //回應404
  res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
