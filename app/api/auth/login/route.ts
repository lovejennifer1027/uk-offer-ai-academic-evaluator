import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { createSessionForUser } from "@/lib/session";
import { findUserByEmail } from "@/services/store/local-store";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const user = await findUserByEmail(payload.email);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await compare(payload.password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await createSessionForUser(user);

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleApiError("auth-login-route", error, "Login failed.");
  }
}
