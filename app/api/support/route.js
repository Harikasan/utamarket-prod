import { NextResponse } from "next/server";
import pool from "@/database/db.js";

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get all active chat sessions with user info
    const [sessions] = await connection.query(`
      SELECT 
        s.id as session_id,
        s.user_id,
        s.admin_id,
        s.status,
        s.last_message_at,
        s.last_admin_reply_at,
        s.last_user_reply_at,
        u.name as user_name,
        u.email as user_email,
        a.name as admin_name,
        (
          SELECT content 
          FROM support_chat_messages 
          WHERE session_id = s.id 
          ORDER BY timestamp DESC 
          LIMIT 1
        ) as last_message
      FROM support_chat_sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users a ON s.admin_id = a.id
      WHERE s.status = 'active'
      ORDER BY s.last_message_at DESC
    `);

    // For each session, get all messages
    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const [messages] = await connection.query(
          `SELECT 
            m.id,
            m.sender_id,
            m.receiver_id,
            m.message_type as type,
            m.content,
            m.timestamp,
            m.is_read,
            CASE 
              WHEN m.message_type = 'admin' THEN admin.name
              ELSE user.name
            END as sender_name
           FROM support_chat_messages m
           JOIN users user ON user.id = m.sender_id
           LEFT JOIN users admin ON admin.id = m.sender_id AND m.message_type = 'admin'
           WHERE m.session_id = ? 
           ORDER BY m.timestamp ASC`,
          [session.session_id]
        );

        return {
          ...session,
          messages: messages.map((msg) => ({
            ...msg,
            displayTime: new Date(msg.timestamp * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithMessages,
    });
  } catch (error) {
    console.error("Error fetching support sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch support sessions" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
