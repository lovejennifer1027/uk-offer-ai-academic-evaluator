import "server-only";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { HttpError, jsonError } from "@/lib/http";

export const ADMIN_SESSION_COOKIE = "uk_offer_admin_session";

function getAdminSecret() {
  return process.env.UKOFFER_ADMIN_TOKEN ?? process.env.ADMIN_API_KEY ?? "";
}

function hashAdminSecret(secret: string) {
  return createHash("sha256").update(`uk-offer-admin:${secret}`).digest("hex");
}

export function isAdminConfigured() {
  return Boolean(getAdminSecret());
}

export function getAdminSessionValue() {
  const secret = getAdminSecret();
  return secret ? hashAdminSecret(secret) : "";
}

export async function hasAdminSession() {
  if (!isAdminConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return sessionCookie === getAdminSessionValue();
}

export function createAdminSessionResponse() {
  if (!isAdminConfigured()) {
    throw new HttpError("后台鉴权尚未配置。请先设置 UKOFFER_ADMIN_TOKEN。", 503);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionValue(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return response;
}

export function clearAdminSessionResponse() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}

export async function requireAdminApiAuth(request: Request) {
  if (!isAdminConfigured()) {
    return jsonError("后台鉴权尚未配置。请先设置 UKOFFER_ADMIN_TOKEN。", 503);
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieMatch = cookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const cookieValue = cookieMatch?.slice(cookieMatch.indexOf("=") + 1) ?? "";
  const headerSecret = request.headers.get("x-admin-key") ?? "";

  if (cookieValue === getAdminSessionValue() || headerSecret === getAdminSecret()) {
    return null;
  }

  return jsonError("未授权访问后台接口。", 401);
}

export async function assertAdminPageAccess() {
  if (!isAdminConfigured()) {
    return {
      allowed: false as const,
      reason: "后台鉴权尚未配置。请先在环境变量中设置 UKOFFER_ADMIN_TOKEN。"
    };
  }

  const allowed = await hasAdminSession();
  return {
    allowed,
    reason: allowed ? "" : "请输入后台访问密钥后继续。"
  };
}
