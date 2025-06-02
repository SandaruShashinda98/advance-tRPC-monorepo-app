import { getUserFromToken } from './utils/jwt.js';

export const createContext = async ({ req, res }) => {
  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.token;

  let user = null;
  if (token) {
    user = await getUserFromToken(token);
    
    // Update last login
    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }
  }

  return {
    user,
    req,
    res
  };
};