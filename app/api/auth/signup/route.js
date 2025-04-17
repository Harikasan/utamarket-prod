import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/database/db.js";

// Function to generate a random 5-digit number
function generateUserId() {
  return Math.floor(10000 + Math.random() * 90000);
}

// Function to check if a user ID already exists
async function isUserIdUnique(connection, userId) {
  try {
    const [existingId] = await connection.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    return existingId.length === 0;
  } catch (error) {
    console.error("Error checking user ID uniqueness:", error);
    throw error;
  }
}

// Function to get a unique user ID
async function getUniqueUserId(connection) {
  let userId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    try {
      userId = generateUserId();
      console.log("Attempting with ID:", userId);
      isUnique = await isUserIdUnique(connection, userId);
      attempts++;
    } catch (error) {
      console.error("Error generating unique ID:", error);
      throw error;
    }
  }

  if (!isUnique) {
    throw new Error("Could not generate unique user ID after maximum attempts");
  }

  return userId;
}

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();
    console.log("Received signup request:", {
      ...body,
      password: "[REDACTED]",
    });

    const { name, email, password, studentId, dateOfBirth, agreeToTerms } =
      body;

    // Validate input
    if (
      !name ||
      !email ||
      !password ||
      !studentId ||
      !dateOfBirth ||
      !agreeToTerms
    ) {
      console.log("Missing required fields:", {
        name: !name,
        email: !email,
        password: !password,
        studentId: !studentId,
        dateOfBirth: !dateOfBirth,
        agreeToTerms: !agreeToTerms,
      });
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate UTA email
    if (!email.endsWith("@mavs.uta.edu")) {
      console.log("Invalid email domain:", email);
      return NextResponse.json(
        { message: "Please use your UTA email address" },
        { status: 400 }
      );
    }

    // Get database connection
    connection = await pool.getConnection();
    console.log("Database connection established");

    // Check if user already exists
    const [existingUsers] = await connection.query(
      "SELECT * FROM users WHERE email = ? OR student_id = ?",
      [email, studentId]
    );

    if (existingUsers.length > 0) {
      console.log("User already exists:", {
        email: existingUsers[0]?.email === email,
        studentId: existingUsers[0]?.student_id === studentId,
      });
      return NextResponse.json(
        { message: "Email or Student ID already registered" },
        { status: 409 }
      );
    }

    // Generate unique user ID
    const userId = await getUniqueUserId(connection);
    console.log("Generated unique user ID:", userId);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Insert new user with the generated ID
    const [result] = await connection.query(
      "INSERT INTO users (id, name, email, password, student_id, date_of_birth, agree_to_terms) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        name,
        email,
        hashedPassword,
        studentId,
        dateOfBirth,
        agreeToTerms,
      ]
    );
    console.log("User inserted successfully");

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: userId,
        name,
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Detailed signup error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Handle specific MySQL errors
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "This user already exists" },
        { status: 409 }
      );
    }

    if (error.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        { message: "Database setup incomplete. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      console.log("Releasing database connection");
      connection.release();
    }
  }
}
