import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "@/database/db.js";

export async function PUT(request) {
  let connection;
  try {
    // Get the token from the cookie
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "utamarket_secret_key_2024"
    );

    // Get request body
    const body = await request.json();
    const {
      name,
      email,
      studentId,
      dateOfBirth,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      preferredPaymentMethod,
      cardLastFour,
      cardType,
      cardExpiryMonth,
      cardExpiryYear,
      currentPassword,
      newPassword,
    } = body;

    // Get database connection
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update user table
      const [userResult] = await connection.query(
        `UPDATE users 
         SET name = ?, email = ?, student_id = ?, date_of_birth = ?
         WHERE id = ?`,
        [name, email, studentId, dateOfBirth, decoded.userId]
      );

      if (userResult.affectedRows === 0) {
        throw new Error("User not found");
      }

      // Update or insert user profile
      const [profileResult] = await connection.query(
        `INSERT INTO user_profiles 
         (user_id, phone_number, address_line1, address_line2, city, state, zip_code, country, 
          preferred_payment_method, card_last_four, card_type, card_expiry_month, card_expiry_year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         phone_number = VALUES(phone_number),
         address_line1 = VALUES(address_line1),
         address_line2 = VALUES(address_line2),
         city = VALUES(city),
         state = VALUES(state),
         zip_code = VALUES(zip_code),
         country = VALUES(country),
         preferred_payment_method = VALUES(preferred_payment_method),
         card_last_four = VALUES(card_last_four),
         card_type = VALUES(card_type),
         card_expiry_month = VALUES(card_expiry_month),
         card_expiry_year = VALUES(card_expiry_year)`,
        [
          decoded.userId,
          phoneNumber,
          addressLine1,
          addressLine2,
          city,
          state,
          zipCode,
          country,
          preferredPaymentMethod,
          cardLastFour,
          cardType,
          cardExpiryMonth,
          cardExpiryYear,
        ]
      );

      // Handle password change if provided
      if (newPassword && currentPassword) {
        // Verify current password
        const [user] = await connection.query(
          "SELECT password FROM users WHERE id = ?",
          [decoded.userId]
        );

        if (user.length === 0) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user[0].password
        );

        if (!isPasswordValid) {
          throw new Error("Current password is incorrect");
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await connection.query("UPDATE users SET password = ? WHERE id = ?", [
          hashedPassword,
          decoded.userId,
        ]);
      }

      // Commit transaction
      await connection.commit();

      return NextResponse.json({
        message: "Settings updated successfully",
      });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Settings update error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || "An error occurred while updating settings" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
