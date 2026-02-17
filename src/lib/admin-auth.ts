// Legacy compatibility wrapper — delegates to new auth system
import { isAdminAuthenticated, getCurrentAdmin } from "./auth";

export { isAdminAuthenticated };

// Legacy: still support single-password login for backward compat
export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function setAdminCookie() {
  // No-op: new auth system handles cookies via loginAdmin()
}

export { getCurrentAdmin };
