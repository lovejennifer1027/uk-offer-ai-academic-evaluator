import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import type { AppUser } from "@/types/scholardesk";
import { findUserByEmail, getOrCreateDemoUser, getUserById } from "@/services/store/local-store";

const SESSION_COOKIE = "scholardesk-session";

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class AdminAccessError extends Error {
  constructor(message = "Admin access required.") {
    super(message);
    this.name = "AdminAccessError";
  }
}

interface SessionPayload {
  userId: string;
  email: string;
  role: AppUser["role"];
}

function getSecret() {
  return process.env.AUTH_SECRET || process.env.UKOFFER_ADMIN_TOKEN || "scholardesk-dev-secret";
}

function encodePayload(payload: SessionPayload) {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const signature = createHmac("sha256", getSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function decodePayload(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = createHmac("sha256", getSecret()).update(body).digest("base64url");

  if (signature.length !== expected.length) {
    return null;
  }

  const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionForUser(user: AppUser) {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    encodePayload({
      userId: user.id,
      email: user.email,
      role: user.role
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    }
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getOptionalSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const payload = decodePayload(token);

    if (payload) {
      const user = await getUserById(payload.userId);
      if (user) {
        return user;
      }

      const fallbackByEmail = await findUserByEmail(payload.email);
      if (fallbackByEmail) {
        return fallbackByEmail;
      }
    }
  }

  if (process.env.AUTH_DEMO_MODE !== "false") {
    return getOrCreateDemoUser();
  }

  return null;
}

export async function requireSessionUser() {
  const user = await getOptionalSessionUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireSessionUser();

  if (user.role !== "admin") {
    if (process.env.AUTH_DEMO_MODE !== "false") {
      const demoAdmin = await findUserByEmail("admin@scholardesk.ai");
      if (demoAdmin) {
        return demoAdmin;
      }
    }
    throw new AdminAccessError();
  }

  return user;
}
