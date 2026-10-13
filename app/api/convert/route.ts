import { NextRequest, NextResponse } from "next/server";

// Using ConvertHandler from the official controllers directory
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ConvertHandler = require("../../../controllers/convertHandler.js");

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
  const input = searchParams.get("input");

  if (!input) {
    return new NextResponse("invalid number and unit", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...CORS_HEADERS,
      },
    });
  }

  const convertHandler = new ConvertHandler();
  const initNum = convertHandler.getNum(input);
  const initUnit = convertHandler.getUnit(input);

  if (initNum === null && initUnit === null) {
    return new NextResponse("invalid number and unit", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...CORS_HEADERS,
      },
    });
  }

  if (initNum === null) {
    return new NextResponse("invalid number", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...CORS_HEADERS,
      },
    });
  }

  if (initUnit === null) {
    return new NextResponse("invalid unit", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        ...CORS_HEADERS,
      },
    });
  }

  const returnNum = convertHandler.convert(initNum, initUnit);
  const returnUnit = convertHandler.getReturnUnit(initUnit);
  const toString = convertHandler.getString(
    initNum,
    initUnit,
    returnNum,
    returnUnit
  );

  return NextResponse.json(
    {
      initNum,
      initUnit,
      returnNum,
      returnUnit,
      string: toString,
    },
    {
      headers: {
        ...CORS_HEADERS,
      },
    }
  );
}
