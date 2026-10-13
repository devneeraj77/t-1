import { NextRequest, NextResponse } from "next/server";
import { convertInput } from "@/lib/convert";

export function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("input");

  if (input === null || input.length === 0) {
    return NextResponse.json({
      error: "invalid number and unit",
    });
  }

  try {
    const result = convertInput(input);

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Conversion failed";

    return NextResponse.json({
      error: message,
    });
  }
}