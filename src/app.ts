import express from 'express';
import { json, text } from 'body-parser';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import {
  signUpRouter,
  verifyRouter,
  loginRouter,
  usersRouter,
  gamesRouter,
  categoriesRouter,
  postRouter,
  conversationRouter
} from './routes';
import { errorHandler } from './middlewares';
import notificationRouter from './routes/notification';
import { IUser } from './models';

const app = express();

const options: cors.CorsOptions = {
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: 'http://localhost:3000',
  credentials: true,
  preflightContinue: false
};

app.use(cors(options));
app.use(json({ limit: '200mb' }));
app.use(text({ limit: '200mb' }));
app.use(cookieParser());

app.use(signUpRouter);
app.use(verifyRouter);
app.use(loginRouter);
app.use(usersRouter);
app.use(gamesRouter);
app.use(categoriesRouter);
app.use(postRouter);
app.use(notificationRouter);
app.use(conversationRouter);

app.use(errorHandler);

const users = [] as { userId: string; socketId: string }[];

function adduser(userId: string, socketId: string) {
  if (users.map((user) => user.userId).includes(userId)) {
    return;
  }
  users.push({ userId, socketId });
}

function removeUser(socketId: string) {
  users.filter((user) => user.socketId !== socketId);
}

function getUser(userId: string) {
  return users.find((user) => user.userId === userId);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const io = require('socket.io')(8900, {
  cors: {
    origin: 'http://localhost:3000'
  }
});

io.on('connection', (socket: any) => {
  console.log('a user connected');

  io.emit('welcome', 'testtttttttt');

  socket.on('addUser', (userId: string) => {
    adduser(userId, socket.id);
    io.emit('getUsers', users);
  });

  socket.on('sendMessage', (user: IUser, receiver: IUser, message: string) => {
    const socketUser = getUser(receiver._id);

    console.log(socketUser, 'socketUser');

    console.log(user?.username, 'user');
    console.log(receiver?.username, 'receiver');
    console.log(message);

    if (socketUser) {
      io.to(socketUser.socketId).emit('getMessage', {
        createdBy: user,
        createdAt: new Date().toLocaleString(),
        content: message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

export default app;
