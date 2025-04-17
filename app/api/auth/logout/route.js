import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Get the cookie store and await it
    const cookieStore = await cookies();

    // Delete the auth token cookie
    await cookieStore.delete("auth_token");

    // You might want to add additional server-side cleanup here
    // For example, invalidating any active sessions in the database

    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          "Set-Cookie":
            "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict",
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
