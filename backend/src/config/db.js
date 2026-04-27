const mongoose = require('mongoose');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in environment variables.');
  }

  const maxRetries = Number(process.env.MONGO_CONNECT_RETRIES || 8);
  const retryDelayMs = Number(process.env.MONGO_CONNECT_RETRY_DELAY_MS || 1500);

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected.');
      return;
    } catch (error) {
      lastError = error;
      const canRetry = attempt < maxRetries;
      console.warn(
        `MongoDB connection failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
      );

      if (canRetry) {
        await wait(retryDelayMs);
      }
    }
  }

  throw lastError;
}

module.exports = connectDatabase;
