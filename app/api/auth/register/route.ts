import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { createSessionForUser } from "@/lib/session";
import { createUser, findUserByEmail } from "@/services/store/local-store";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const existing = await findUserByEmail(payload.email);

    if (existing) {
      return NextResponse.json({ error: "Account already exists." }, { status: 409 });
    }

    const user = await createUser({
      name: payload.name,
      email: payload.email,
      passwordHash: await hash(payload.password, 10),
      role: "student",
      plan: "free"
    });

    await createSessionForUser(user);

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return handleApiError("auth-register-route", error, "Registration failed.");
  }
}
