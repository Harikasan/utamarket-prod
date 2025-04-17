import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Simple auth check using JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

      // Check if user is admin
      if (decoded.email !== "admin@mavs.uta.edu" || decoded.name !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Get all tickets with details
      const [tickets] = await connection.query(`
        SELECT 
          id,
          name,
          email,
          subject,
          message,
          order_number,
          status,
          created_at,
          updated_at
        FROM customer_tickets
        ORDER BY 
          CASE 
            WHEN status = 'pending' THEN 1
            WHEN status = 'in_progress' THEN 2
            ELSE 3
          END,
          created_at DESC
      `);

      // Get total tickets count
      const [totalTicketsResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM customer_tickets
      `);

      // Get open (pending) tickets count
      const [openTicketsResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM customer_tickets
        WHERE status = 'pending'
      `);

      // Get tickets resolved today
      const [resolvedTodayResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM customer_tickets
        WHERE status = 'resolved'
        AND DATE(updated_at) = CURDATE()
      `);

      const stats = {
        totalTickets: Number(totalTicketsResult[0].total),
        openTickets: Number(openTicketsResult[0].total),
        resolvedToday: Number(resolvedTodayResult[0].total),
      };

      return NextResponse.json({
        tickets,
        stats,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Tickets API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Simple auth check using JWT token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

      // Check if user is admin
      if (decoded.email !== "admin@mavs.uta.edu" || decoded.name !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { ticketId, status } = data;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: "Ticket ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["pending", "in_progress", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Update ticket status
      await connection.query(
        `UPDATE customer_tickets 
         SET status = ?, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, ticketId]
      );

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
