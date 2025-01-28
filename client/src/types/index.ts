export interface User {
    id: number;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
  }
  
  export interface KYC {
    id: number;
    userId: number;
    fullName: string;
    documentUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    confirmPassword: string;
  }
  
  export interface KYCSubmission {
      fullName: string;
      document: File | null;
    }
  
  export interface KYCStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }
  // types/index.ts
export interface KYC {
    id: number;
    userId: number;
    fullName: string;
    documentUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
  }
  
  export interface KYCSubmission {
    fullName: string;
    document: File | null;
  }
  
  export interface KYCStats {
    totalUsers: number;
    totalKYCs: number;
    kycStats: {
      PENDING: number;
      APPROVED: number;
      REJECTED: number;
    };
    verificationRate: string;
    recentSubmissions: KYC[];
  }