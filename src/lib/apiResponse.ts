import { NextResponse } from "next/server";

interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}

export function apiResponse<T>(
  data: T,
  options: ApiResponseOptions = {}
) {
  const { status = 200, headers = {} } = options;

  const response = {
    author: "Wanyzx",
    ...data,
  };

  return NextResponse.json(response, { status, headers });
}

export function apiError(
  error: string,
  status: number = 500
) {
  return NextResponse.json(
    {
      author: "Wanyzx",
      success: false,
      error,
    },
    { status }
  );
}
