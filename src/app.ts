import express from 'express';
import homeRoutes from './apis/helloWorld.js';
import screen1Routes from './apis/route1.js';

const app = express();
const port = 8080;

// Use imported routes
app.use('/', homeRoutes);
app.use('/screen1', screen1Routes);

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});