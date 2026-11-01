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
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const apiPath = requestUrl.searchParams.get('__api_path');

  if (!apiPath) {
    return res.status(404).json({ message: 'API route not found.' });
  }

  requestUrl.searchParams.delete('__api_path');
  req.url = `/api/${apiPath.replace(/^\/+/, '')}${requestUrl.search}`;
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
