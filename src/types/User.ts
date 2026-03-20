export interface UserAttributes {
  password: string;
  email: string;
  phoneNumber?: string;
  cpf?: string;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  lastFailedLoginAt: Date | null;
}
