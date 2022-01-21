import express from 'express';
import { json } from 'body-parser';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { signUpRouter, verifyRouter, loginRouter, usersRouter, gamesRouter } from './routes';
import { errorHandler } from './middlewares';

const app = express();

const options: cors.CorsOptions = {
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: 'http://localhost:3000',
  credentials: true,
  preflightContinue: false
};

app.use(cors(options));
app.use(json());
app.use(cookieParser());

app.use(signUpRouter);
app.use(verifyRouter);
app.use(loginRouter);
app.use(usersRouter);
app.use(gamesRouter);

app.use(errorHandler);

export default app;
