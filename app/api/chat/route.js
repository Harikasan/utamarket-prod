import { NextResponse } from "next/server";
import pool from "@/database/db.js";
import { getCurrentUser } from "@/app/utils/auth";

export async function GET(request) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Get the active session for this user
    const [activeSessions] = await connection.query(
      `SELECT id FROM support_chat_sessions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY last_message_at DESC LIMIT 1`,
      [userId]
    );

    if (activeSessions.length === 0) {
      return NextResponse.json({
        success: true,
        messages: [],
        sessionId: null,
      });
    }

    const sessionId = activeSessions[0].id;

    // Fetch all messages for this session
    const [messages] = await connection.query(
      `SELECT id, sender_id, receiver_id, message_type as type, content, timestamp, is_read 
       FROM support_chat_messages 
       WHERE session_id = ? 
       ORDER BY timestamp ASC`,
      [sessionId]
    );

    return NextResponse.json({
      success: true,
      messages: messages.map((msg) => ({
        ...msg,
        displayTime: new Date(msg.timestamp * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      sessionId,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat history" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(request) {
  let connection;
  try {
    const body = await request.json();

    // Get the admin's information from auth
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Admin not authenticated" },
        { status: 401 }
      );
    }

    // Get database connection
    connection = await pool.getConnection();

    // Get user details from database
    const [users] = await connection.query(
      `SELECT id, name, email FROM users WHERE id = ?`,
      [body.userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Log admin messages in the terminal
    if (body.type === "admin") {
      console.log("\n=== Admin Message ===");
      console.log("Session ID:", body.sessionId);
      console.log("Sender (Admin) ID:", admin.userId);
      console.log("Sender (Admin) Name:", admin.name);
      console.log("Receiver (User) ID:", user.id);
      console.log("Receiver (User) Name:", user.name);
      console.log("Receiver (User) Email:", user.email);
      console.log("Content:", body.content);
      console.log("Unix Timestamp:", body.timestamp);
      console.log(
        "Human Readable Time:",
        new Date(body.timestamp * 1000).toLocaleString()
      );
      console.log("===================\n");
    }

    // Check if there's an active session for this user
    const [activeSessions] = await connection.query(
      `SELECT id FROM support_chat_sessions 
       WHERE user_id = ? AND status = 'active' 
       ORDER BY last_message_at DESC LIMIT 1`,
      [body.userId]
    );

    let sessionId;
    if (activeSessions.length === 0) {
      // Create a new chat session
      const [result] = await connection.query(
        `INSERT INTO support_chat_sessions (user_id, status) 
         VALUES (?, 'active')`,
        [body.userId]
      );
      sessionId = result.insertId;
    } else {
      sessionId = activeSessions[0].id;
    }

    // Insert the message with Unix timestamp and set initial read status
    const [messageResult] = await connection.query(
      `INSERT INTO support_chat_messages 
       (session_id, sender_id, receiver_id, message_type, content, timestamp, is_read) 
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [
        sessionId,
        body.type === "admin" ? admin.userId : body.userId, // sender_id
        body.type === "admin" ? body.userId : admin.userId, // receiver_id
        body.type,
        body.content,
        body.timestamp,
      ]
    );

    // Update the session's last_message_at and specific reply timestamps
    if (body.type === "admin") {
      await connection.query(
        `UPDATE support_chat_sessions 
         SET last_message_at = CURRENT_TIMESTAMP,
             last_admin_reply_at = CURRENT_TIMESTAMP,
             admin_id = ?,
             status = 'active'
         WHERE id = ?`,
        [admin.userId, sessionId]
      );

      // Mark any unread user messages in this session as read by admin
      await connection.query(
        `UPDATE support_chat_messages 
         SET is_read = true, 
             read_at = CURRENT_TIMESTAMP
         WHERE session_id = ? 
         AND message_type = 'user' 
         AND is_read = false`,
        [sessionId]
      );
    } else {
      await connection.query(
        `UPDATE support_chat_sessions 
         SET last_message_at = CURRENT_TIMESTAMP,
             last_user_reply_at = CURRENT_TIMESTAMP,
             status = 'active'
         WHERE id = ?`,
        [sessionId]
      );
    }

    // Get the receiver's information for the response
    const [receiver] = await connection.query(
      `SELECT id, name, email FROM users WHERE id = ?`,
      [body.type === "admin" ? body.userId : admin.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Message stored successfully",
      sessionId: sessionId,
      messageId: messageResult.insertId,
      receiver: receiver[0],
      isRead: false,
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message",
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
