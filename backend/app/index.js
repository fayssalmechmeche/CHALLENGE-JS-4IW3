import express from 'express';
import cors from 'cors';
import { SessionRouter } from './routers/session';
import { UserRouter } from './routers/user';
import { StatusCodes } from 'http-status-codes';
import { RequestError } from './helpers/error';
import { SneakerRouter } from './routers/sneaker';
import { ValidationError } from 'sequelize';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'https://sneakpeak.store'],
    methods: 'GET,POST,PUT',
    allowedHeaders: 'Content-Type,Authorization',
  }),
);
app.use(express.json());
app.use('/', UserRouter);
app.use('/', SessionRouter);
app.use('/', SneakerRouter);

/* eslint-disable @typescript-eslint/no-unused-vars */
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof RequestError) {
    return res.status(err.status).json({ errors: [err.message] });
  }

  if (err instanceof ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({ errors: err.errors });
  }

  return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
});

export default app;
