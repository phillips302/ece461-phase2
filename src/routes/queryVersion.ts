import { Router } from 'express';
import { fetchVersionHistory } from '../tools/fetchVersion.js';

const router = Router();

router.get('/queryVersion/:owner/:name', async (req, res) => {
  try {
    const { owner, name } = req.params;
    const versionHistory = await fetchVersionHistory(owner, name);
    res.status(200).send({ versionHistory });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch version history' });
  }
});

export default router;