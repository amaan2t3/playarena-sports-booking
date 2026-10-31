import { app } from '../backend/src/app.js';
import { initDatabase } from '../backend/src/services/store.js';

let initialization;

export default async function handler(req, res) {
  initialization ??= initDatabase();

  try {
    await initialization;
    return app(req, res);
  } catch (error) {
    console.error('Unable to initialize PlayArena API:', error);
    return res.status(500).json({ message: 'Unable to initialize the PlayArena API.' });
  }
}
