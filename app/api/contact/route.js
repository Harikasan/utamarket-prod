import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import { validateEmail } from "@/utils/validation";

export async function POST(request) {
  let connection;
  try {
    // Parse the request body
    const { name, email, subject, message, orderNumber } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format using utility function
    if (!validateEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get database connection from pool
    connection = await pool.getConnection();

    // Insert the message into the database
    const [result] = await connection.execute(
      `
      INSERT INTO customer_tickets 
      (name, email, subject, message, order_number) 
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, subject, message, orderNumber || null]
    );

    // Send an auto-reply email (you can implement this later)
    // await sendAutoReplyEmail(email, name);

    return NextResponse.json({
      message: "Message sent successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
