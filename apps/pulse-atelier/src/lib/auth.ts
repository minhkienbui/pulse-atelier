import type { Account } from "@/data/accounts";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function authenticateAccount(accounts: Account[], email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

  return (
    accounts.find(
      (account) => normalizeEmail(account.email) === normalizedEmail && account.password === password,
    ) ?? null
  );
}

export function getAccountByRole(accounts: Account[], role: Account["role"]) {
  return accounts.find((account) => account.role === role) ?? null;
}

export function accountEmailExists(accounts: Account[], email: string) {
  const normalizedEmail = normalizeEmail(email);

  return accounts.some((account) => normalizeEmail(account.email) === normalizedEmail);
}

export function createAccountId(email: string) {
  return `acct-${normalizeEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export function createCustomerId(email: string) {
  return `cust-${normalizeEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}
