import express from 'express';
import homeRoutes from './routes/helloWorld.js';
import screen1Routes from './routes/route1.js';
import queryVersionRoutes from './routes/queryVersion.js';

const app = express();
const port = 80;

// Use imported routes ?
app.use('/', homeRoutes);
app.use('/', screen1Routes);
app.use('/', queryVersionRoutes);

app.listen(port, () => {
  console.log(`Express is listening exposed at port ${port}`);
});
