import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('Hello World from the Home API!');
});

export default router;