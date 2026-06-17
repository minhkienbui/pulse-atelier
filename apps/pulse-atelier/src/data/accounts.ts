export type AuthRole = "guest" | "user" | "admin";

export interface Account {
  id: string;
  email: string;
  password: string;
  role: Exclude<AuthRole, "guest">;
  name: string;
  customerId: string | null;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export const accounts: Account[] = [
  {
    id: "acct-user-minh-anh",
    email: "user@pulse.vn",
    password: "123456",
    role: "user",
    name: "Minh Anh",
    customerId: "cust-minh-anh",
  },
  {
    id: "acct-admin-ops",
    email: "admin@pulse.vn",
    password: "admin123",
    role: "admin",
    name: "Pulse Admin",
    customerId: null,
  },
];
