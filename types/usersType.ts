export interface User {
  id: number | undefined;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date | undefined;
  role: string;
  status: boolean | undefined;
  verified: boolean | undefined;
  kyc?: Kyc | undefined;
  avatar: string | undefined;
}
export interface Kyc {
  title: string;
  userId: number;
  user?: User;
}
