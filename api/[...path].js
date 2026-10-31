import { app } from '../backend/src/app.js';
import { initDatabase } from '../backend/src/services/store.js';

let initialization;

function getSafeErrorDetails(error) {
  const message = String(error.message || 'Unknown error')
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, 'mongodb+srv://[REDACTED]');
  return {
    name: error.name,
    ...(error.code ? { code: error.code } : {}),
    message
  };
}

export default async function handler(req, res) {
  initialization ??= initDatabase();

  try {
    await initialization;
    return app(req, res);
  } catch (error) {
    console.error('Unable to initialize PlayArena API:', getSafeErrorDetails(error));
    return res.status(500).json({
      message: error.message || 'Unable to initialize the PlayArena API.'
    });
  }
}
