import dotenv from 'dotenv-safe';
import mongoose from 'mongoose';

import app from './app';
import { EmailSender, NodeMailerEmailApi } from './utils';

const parsedNodeEnv = process.env.NODE_ENV || 'development';

dotenv.config({
  path: parsedNodeEnv === 'development' ? '.env.dev' : '.env.production'
});

const emailSender = EmailSender.getInstance();

emailSender.activate();
emailSender.setEmailApi(new NodeMailerEmailApi());

const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.bsxbu.mongodb.net/duofinderDB?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => app.listen(process.env.PORT || 5757, () => console.log('Backend is running')))
  .catch((err) => console.log(err));
