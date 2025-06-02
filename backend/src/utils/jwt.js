import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).populate('roles');
    return user;
  } catch (error) {
    return null;
  }
};