import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app/index.js';
import { sequelize } from './app/models/index.js';
import { checkCartExpired } from './cron/checkCart';
import { alertResetPassword } from './bin/alertResetPassword.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('PostgreSQL connected');
  })
  .catch((err) => {
    console.error(err);
  });

mongoose
  .connect(MONGODB_URI, { dbName: 'sneakpeak' })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error(err);
  });

alertResetPassword.start();

app.listen(PORT, () => {
  console.log(`SneakPeak API listening on port ${PORT}`);
});

checkCartExpired.start();
export default app;
