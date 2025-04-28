import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import bcrypt from "bcrypt"; // Import bcrypt for password hashing

export async function POST(request) {
  let connection;
  try {
    const { email, utaId, newPassword } = await request.json();

    // Validate input
    if (!email || !utaId || !newPassword) {
      return NextResponse.json(
        { message: "Email, UTA ID, and new password are required" },
        { status: 400 }
      );
    }

    // Get database connection
    connection = await pool.getConnection();

    // Check if the user exists with the provided email and UTA ID
    const [users] = await connection.query(
      "SELECT id FROM users WHERE email = ? AND student_id = ?",
      [email, utaId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { message: "No user found with this email and UTA ID" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await connection.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      user.id,
    ]);

    return NextResponse.json({
      message: "Password has been updated successfully.",
    });
  } catch (error) {
    console.error("Error in forgot password API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
