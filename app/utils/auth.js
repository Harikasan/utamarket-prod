import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    return {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
