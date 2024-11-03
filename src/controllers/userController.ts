import { Request, Response } from 'express';

// Simulate a user database
let users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' }
];

// GET all users
export const getUsers = (req: Request, res: Response) => {
  res.json(users);
};

// GET a user by ID
export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// POST a new user
export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
  };
  users.push(newUser);
  res.status(201).json(newUser);
};

// PUT (update) an existing user
export const updateUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const user = users.find(u => u.id === parseInt(id));

  if (user) {
    user.name = name;
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// DELETE a user by ID
export const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1);
    res.json(deletedUser);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
