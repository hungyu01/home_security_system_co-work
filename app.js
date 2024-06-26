import express, { json, urlencoded, strict } from 'express';
import { join } from 'path';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import { create } from 'connect-mongo';
import { DBHOST, DBPORT, DBNAME } from './config/config';
import indexRouter from './routes/web/index';
import authRouter from './routes/web/auth';
import authApiRouter from './routes/api/auth';
import accountRouter from './routes/api/account';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

// Session setup with MongoDB store
app.use(session({
  name: 'sid',
  secret: 'aiml05_02',
  store: create({
    mongoUrl: `mongodb://${DBHOST}:${DBPORT}/${DBNAME}`,
    ttl: 7 * 24 * 60 * 60, // session TTL (7 days)
  }),
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // session cookie max age (7 days)
  },
}));

// View engine setup
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(join(__dirname, 'public', 'picture', 'favicon.ico')));
app.use('/public', strict(join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/api', accountRouter);
app.use('/api', authApiRouter);

// HTTP server and Socket.IO setup
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Socket client connected');

  socket.on('streamFace', (data) => handleStreamEvent('streamFace', data, socket));
  socket.on('streamFall', (data) => handleStreamEvent('streamFall', data, socket));
  socket.on('streamFire', (data) => handleStreamEvent('streamFire', data, socket));

  socket.on('disconnect', () => {
    console.log('Socket client disconnected');
    io.emit('dis');
  });
});

function handleStreamEvent(eventType, data, socket) {
  try {
    // Handle or broadcast data
    socket.broadcast.emit(eventType, data);
  } catch (error) {
    console.error(`Error handling ${eventType} event:`, error);
  } finally {
    data = null;
  }
}

// Error handling
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default { app, server };