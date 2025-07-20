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

export interface GooglePayload {
  email: string;
  given_name: string;
  family_name?: string;
  picture?: string;
}

export interface SendMailData {
  to: string;
  template: {
    subject?: string;
    body: string;
  };
  [key: string]: any; // allows dynamic variables like name, password
}
