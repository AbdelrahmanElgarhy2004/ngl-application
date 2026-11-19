import http from 'http';
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { logger } from "./pkg/logger/logger.js";

const app = createApp();

const server = http.createServer(app);

server.listen(3000, () => logger.info("Server started on port: 3000" ));

function shutdown() {
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);

process.on('SIGTERM', shutdown);