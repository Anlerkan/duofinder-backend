import express from 'express';
import { json, text } from 'body-parser';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import {
  signUpRouter,
  verifyRouter,
  loginRouter,
  usersRouter,
  gamesRouter,
  categoriesRouter,
  postRouter
} from './routes';
import { errorHandler } from './middlewares';
import notificationRouter from './routes/notification';

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

app.use(errorHandler);

export default app;
