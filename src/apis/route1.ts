import { Router } from 'express';

const router = Router();

router.get('/screen1', (req, res) => {
  res.send('Hello World from the Screen 1!');
});

export default router;