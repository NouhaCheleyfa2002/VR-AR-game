import express from 'express';
const userRouter = express.Router();

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserScore,
  getUserGameplayHistory
} from '../controllers/User.js';

import {
  register,
  login
} from '../middleware/auth.js';


//authenticatio routes
// POST /api/users/register
userRouter.post('/register', register);

// POST /api/users/login
userRouter.post('/login', login);


//user mangement routes
// GET /api/users
userRouter.get('/', getAllUsers);

// GET /api/users/:id
userRouter.get('/:id', getUserById);

// GET /api/users/:id/score
userRouter.get('/:id/score', getUserScore);

// GET /api/users/:id/gameplay-history
userRouter.get('/:id/gameplay-history', getUserGameplayHistory);

// POST /api/users
userRouter.post('/', createUser);

// PUT /api/users/:id
userRouter.put('/:id', updateUser);

// DELETE /api/users/:id
userRouter.delete('/:id', deleteUser);

export default userRouter;
