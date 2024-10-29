import express, { Application, Request, Response } from 'express';
import homeRoutes from './routes/helloWorld.js';
import screen1Routes from './routes/route1.js';
import apiRoutes from './routes/api.js';
import queryVersionRoutes from './routes/queryVersion.js';

const app: Application = express();
const port = 8080;

app.use(express.json());
// Use imported routes
app.use('/', homeRoutes);
app.use('/', screen1Routes);
app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the REST API!');
});

app.listen(port, () => {
  console.log(`Express is listening exposed at port ${port}`);
});
