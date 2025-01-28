import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  confirmPassword: string;
}

export interface KYCSubmissionDTO {
  fullName: string;
  documentUrl?: string;
}