import express, { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from '../../middlewares';
const { findUserById } = require('./users.services');
import { getAllUsers, getUserDetails, updateUserDetailById } from './users.services';  // The service function


const router = express.Router();

export interface Payload {
  userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    payload?: Payload;
  }
}


// Helper function to handle common validation and update logic
async function handleUpdate(userId: string, updateUserId: string, updateData: { email?: string, name?: string, isAdmin?: boolean }) {
  // Validate the request body (only one field must be present)
  if (!updateData.email && !updateData.name && updateData.isAdmin === undefined) {
    throw { status: 400, message: 'Bad Request: You must provide at least one field to update' };
  }

  // Check if the user is trying to update 'isAdmin' (only allowed for admins)
  if (updateData.isAdmin !== undefined && !updateData.isAdmin) {
    delete updateData.isAdmin;  // Remove isAdmin if it's not allowed to update
  }

  const validationData = {
    email: updateData.email,
    name: updateData.name,
  };
  // Proceed with updating the user details
  if (!validationData.email || !validationData.name) {
    throw { status: 400, message: 'Bad Request: Email and name are required' };
  }
  const updatedUser = await updateUserDetailById(updateUserId, validationData as { email: string; name: string; isAdmin?: boolean });
  return updatedUser;
}

// Endpoint to get user profile details or all users based on role
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (req.payload && req.payload.userId) {
      const user = await getUserDetails(req.payload.userId);
      if (user) {
        // Check if user is an admin
        if (user.IsAdmin) {
          const user = await getUserDetails(req.payload.userId);
          // If admin, return the list of all users
          const users = await getAllUsers();
          return res.status(200).json({ users, user });
        } else {
          // If not admin, return details of the authenticated user
          return res.status(200).json({ user });
        }
      } else {
        return res.status(404).json({ message: 'User not found.' });
      }
    }
    return res.status(400).json({ message: 'Invalid request.' });
  } catch (error) {
    console.error('Error fetching user details or user list:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.payload as { userId: string };
    const user = await findUserById(userId);
    if (!user) {
      return res.sendStatus(404);
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    // delete user.password;
    // res.json(user);
  } catch (err) {
    console.error('Error getting user profile', err);
    next(err);
  }
});

// PUT request to update user details
router.put('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.payload as { userId: string }; // Extract userId from the payload


    const updateUserId = req.params.userId || userId; // You can update yourself or an admin can update another user
    const { email, name, isAdmin } = req.body; // Extract update data from request body

    // ensure the user is same as the one in the payload
    if (userId !== updateUserId) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    const result = await handleUpdate(userId, userId, { email, name });

    // Return the result from the service function
    return res.status(result.status).json({ message: result.message, data: result.data });

  } catch (err) {
    console.error('Error updating user profile', err);
    next(err); // Pass error to error handling middleware
  }
});

// PUT request for admin-update (admins can update any user's profile)
router.put('/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Admin update user profile');
    console.log('req.body:', req.payload);
    const { userId } = req.payload as { userId: string }; // Admin user ID from the payload
    const user = await findUserById(userId);
    const updateUserId = req.params.id; // The target user ID from the route params
    const { email, name, isAdmin } = req.body; // Extract update data

    // Check if the user is an admin
    if (!user || !user.IsAdmin) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    const result = await handleUpdate(userId, updateUserId, { email, name, isAdmin });
    return res.status(result.status).json({ message: result.message, data: result.data });
  } catch (err) {
    console.error('Error updating user profile', err);
    next(err); // Pass error to error handling middleware
  }
});

module.exports = { user: router };