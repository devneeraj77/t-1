import { NextRequest, NextResponse } from "next/server";
import { filterTests } from "@/lib/testReport";
import fs from "fs";
import path from "path";

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const slugPath = slug.join("/");
  const { searchParams } = new URL(request.url);

  if (slugPath === "get-tests") {
    const type = searchParams.get("type");
    const n = searchParams.get("n");
    const tests = filterTests(type, n);
    return NextResponse.json(tests, {
      headers: CORS_HEADERS,
    });
  }

  if (slugPath === "controllers/convertHandler.js") {
    try {
      const filePath = path.join(process.cwd(), "controllers/convertHandler.js");
      const content = fs.readFileSync(filePath, "utf8");
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          ...CORS_HEADERS,
        },
      });
    } catch {
      return new NextResponse("File not found", { status: 404, headers: CORS_HEADERS });
    }
  }

  if (slugPath === "routes/api.js") {
    try {
      const filePath = path.join(process.cwd(), "routes/api.js");
      const content = fs.readFileSync(filePath, "utf8");
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          ...CORS_HEADERS,
        },
      });
    } catch {
      return new NextResponse("File not found", { status: 404, headers: CORS_HEADERS });
    }
  }

  if (slugPath === "server.js") {
    try {
      const filePath = path.join(process.cwd(), "server.js");
      const content = fs.readFileSync(filePath, "utf8");
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          ...CORS_HEADERS,
        },
      });
    } catch {
      return new NextResponse("File not found", { status: 404, headers: CORS_HEADERS });
    }
  }

  if (slugPath === "app-info") {
    return NextResponse.json(
      { headers: {} },
      {
        headers: CORS_HEADERS,
      }
    );
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: CORS_HEADERS,
  });
}
