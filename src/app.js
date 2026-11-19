import cookieParser from "cookie-parser";
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { correlationId } from "./lib/correlation/correlationId.js";
import './lib/db/mongoose.js';
import { globalErrorHandler } from "./lib/error/error.handler.js";
import { AppError } from "./lib/error/error.js";
import { toMs } from "./pkg/utils/time.js";
import { router } from "./route.js";

export function createApp() {
  const app = express();

  const limiter = rateLimit({
    limit: 3,
    windowMs: toMs(1, 'minutes'),
    standardHeaders: "draft-7",
    handler: function (req, res, next) {
      next(new AppError(this.message, this.statusCode));
    }
  })

  app.use(cors({ origin: '*' }));

  app.use('/uploads', express.static('uploads'));
  app.use(express.json());
  app.use(cookieParser());
  app.use(correlationId);

  app.get('/health', limiter, (req, res, next) => {
    console.log('Server 1 Hit');
    res.json('OK');
  });
  app.use('/api', router);

  app.use(globalErrorHandler);

  return app;
}