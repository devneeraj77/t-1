import { NextRequest, NextResponse } from "next/server";
import { filterTests } from "@/lib/testReport";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const n = searchParams.get("n");
  const tests = filterTests(type, n);

  return NextResponse.json(tests, {
    headers: CORS_HEADERS,
  });
}
