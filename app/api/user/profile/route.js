import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/database/db.js";
import { cookies } from "next/headers";

export async function GET(request) {
  let connection;
  try {
    // Get the token from the cookie using async cookies API
    const cookieStore = await cookies();
    const token = await cookieStore.get("auth_token");
    const tokenValue = token?.value;

    if (!tokenValue) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      tokenValue,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get database connection
    connection = await pool.getConnection();

    // Fetch user data with profile information
    const [users] = await connection.query(
      `SELECT u.id, u.name, u.email, u.student_id, u.date_of_birth, u.created_at,
              p.phone_number, p.address_line1, p.address_line2, p.city, p.state, 
              p.zip_code, p.country, p.preferred_payment_method, p.card_last_four, 
              p.card_type, p.card_expiry_month, p.card_expiry_year
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Format dates
    const dateOfBirth = user.date_of_birth
      ? new Date(user.date_of_birth).toISOString().split("T")[0]
      : null;
    const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.student_id,
        dateOfBirth: dateOfBirth,
        joinDate: joinDate,
        // Profile Information
        phoneNumber: user.phone_number || "",
        addressLine1: user.address_line1 || "",
        addressLine2: user.address_line2 || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zip_code || "",
        country: user.country || "USA",
        // Payment Information
        preferredPaymentMethod: user.preferred_payment_method || "Credit Card",
        cardLastFour: user.card_last_four || "",
        cardType: user.card_type || "",
        cardExpiryMonth: user.card_expiry_month || "",
        cardExpiryYear: user.card_expiry_year || "",
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "An error occurred while fetching profile" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
