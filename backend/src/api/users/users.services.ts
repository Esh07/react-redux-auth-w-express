const bcrypt = require('bcrypt');
import { User as PrismaUser, RefreshToken } from '@prisma/client';
import db from '../../lib/db';


// Extend the User type to include refreshTokens
interface User extends PrismaUser {
  refreshTokens?: RefreshToken[];
}

function findUserByEmail(email: string): Promise<User | null> {
  // console.log(db); // Add this line to check if db is correctly initialized
  try {
    const user = db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('User not found code line 17');
    }
    return user;
  }
  catch (err) {
    console.log(err);
    throw new Error('User not found');
    // return db.user.findUnique({
    //   where: {
    //     email,
    //   },
    // });
  }
}

// check if user is admina
async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  return user?.IsAdmin ?? false;
}




function createUserByEmailAndPassword(user: { email: string; password: string; name: string }): Promise<User> {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    }
  });
}

// Extend the User type to include refreshTokens
interface User extends PrismaUser {
  refreshTokens?: RefreshToken[];
}

function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({
    where: {
      id,
    },
    include: {
      refreshTokens: true,
    },
  });
}


function getUserDetails(userId: string) {

  return db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      name: true,
      createdAt: true,
      IsAdmin: true,
    },
  });
}

function getAllUsers(): Promise<User[]> {
  return db.user.findMany();
}


// Update user details by admin or user itself
export async function updateUserDetailById(
  updateUserId: string, // The target user being updated
  updateData: { email: string; name: string; isAdmin?: boolean }
): Promise<{ status: number; message: string; data?: any }> {

  try {
    // Get the user to be updated
    const userToUpdate = await db.user.findUnique({
      where: { id: updateUserId },
    });

    if (!userToUpdate) {
      return {
        status: 404,
        message: 'User not found',
      };
    }

    // Prevent duplicate email if updated
    if (updateData.email && updateData.email !== userToUpdate.email) {
      const emailExists = await db.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return {
          status: 409,
          message: 'Email already exists',
        };
      }
    }

    // If the user is trying to update 'isAdmin', ensure the user is an admin
    if (updateData.hasOwnProperty('isAdmin') && !updateData.isAdmin) {
      delete updateData.isAdmin;
    }

    // Update user details
    const updatedUser = await db.user.update({
      where: { id: updateUserId },
      data: updateData,
    });

    return {
      status: 200,
      message: 'User updated successfully',
      data: updatedUser,
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      status: 500,
      message: 'Internal server error',
    };
  }
}

function deleteUserById(userId: string): Promise<User> {

  // check if user is exists
  const user = db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return db.user.delete({
    where: {
      id: userId,
    },
  });
}


export {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
  getUserDetails,
  getAllUsers,
  isAdmin,
  deleteUserById
};