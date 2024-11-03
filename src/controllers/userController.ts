import { Request, Response } from 'express';

export const getUsers = (req: Request, res: Response) => {
  const users = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }];
  res.json(users);
};

export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  const user = { id, name: 'John Doe' };
  res.json(user);
};