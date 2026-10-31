import { app } from './app.js';
import { initDatabase } from './services/store.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`PlayArena Sports Booking API running on port ${PORT}`);
    console.log('Cities: Rawalpindi | Skardu');
    console.log('Sports: Football | Tennis | Cricket | Badminton | Others');
  });
}

start();
