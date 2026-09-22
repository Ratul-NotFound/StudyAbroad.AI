/**
 * BFF API Route — Proxy to Python FastAPI backend
 * Next.js handles CORS, auth headers, and rate limiting here.
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function proxyRequest(req: NextRequest, pathname: string) {
  const url = new URL(pathname, BACKEND_URL);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  // Forward auth token if present
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

  const backendRes = await fetch(url.toString(), {
    method: req.method,
    headers,
    body,
    signal: AbortSignal.timeout(60_000),
  });

  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("Content-Type") ?? "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = "/" + params.path.join("/");
  return proxyRequest(req, path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}
