import { Router } from 'express';
import { fetchVersion } from '../tools/fetchVersion.js';

const router = Router();

router.get('/queryVersion/:owner/:name', async (req, res) => {
  try {
    const { owner, name } = req.params;
    const versionHistory = await fetchVersion(owner, name);
    res.status(200).send({ versionHistory });
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch version history' });
  }
});

export default router;