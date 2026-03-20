import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/http";
import { localeCookieName } from "@/lib/i18n";

const schema = z.object({
  locale: z.enum(["en", "zh"])
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const response = NextResponse.json({ ok: true });
    response.cookies.set(localeCookieName, payload.locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return response;
  } catch (error) {
    return handleApiError("language-preference-route", error, "Failed to update language preference.");
  }
}
