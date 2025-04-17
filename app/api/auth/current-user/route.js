import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/utils/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "No authenticated user" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { message: "Failed to get current user" },
      { status: 500 }
    );
  }
}
