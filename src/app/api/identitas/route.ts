import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "I Ketut Dharmawan",
    age: 18,
    occupation: "Learning JavaScript",
    location: "Bali, Indonesia",
    status: "Jomblo Happy",
    role: "Prompt Engineer & AI Enthusiast",
  });
}
