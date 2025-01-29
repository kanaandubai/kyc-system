import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      id: number;
      email: string;
      role: string;
    };
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add isAdmin middleware
export const isAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status' });
  }
};