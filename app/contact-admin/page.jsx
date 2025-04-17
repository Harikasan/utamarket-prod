"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  User,
  ShieldCheck,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Circle,
} from "lucide-react";

// WebSocket
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setLastMessage(message);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  return { socket, isConnected, lastMessage, sendMessage };
};

export default function ContactAdminPage() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [lastMessageId, setLastMessageId] = useState(null);

  // Function to fetch new messages for the current session
  const fetchNewMessages = async () => {
    if (!selectedSession) return;

    try {
      const response = await fetch(
        `/api/chat?userId=${selectedSession.user_id}`
      );
      const data = await response.json();

      if (data.success && data.messages.length > 0) {
        const lastMsg = data.messages[data.messages.length - 1];

        // Only update if we have new messages
        if (!lastMessageId || lastMsg.id > lastMessageId) {
          setMessages(data.messages);
          setLastMessageId(lastMsg.id);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error fetching new messages:", error);
    }
  };

  // Function to fetch all active sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/support");
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setLoading(false);
    }
  };

  // Set up polling for new messages and sessions
  useEffect(() => {
    // Initial fetch
    fetchSessions();

    // Set up polling intervals
    const sessionsInterval = setInterval(fetchSessions, 5000); // Poll every 5 seconds
    const messagesInterval = setInterval(fetchNewMessages, 2000); // Poll every 2 seconds

    // Cleanup intervals on unmount
    return () => {
      clearInterval(sessionsInterval);
      clearInterval(messagesInterval);
    };
  }, []); // Empty dependency array for initial setup

  // Additional polling for new messages when session changes
  useEffect(() => {
    if (selectedSession) {
      fetchNewMessages();
    }
  }, [selectedSession]);

  // Scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredSessions = sessions.filter(
    (session) =>
      session.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setMessages(session.messages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession) return;

    try {
      const unixTimestamp = Math.floor(Date.now() / 1000);
      const message = {
        sessionId: selectedSession.session_id,
        userId: selectedSession.user_id,
        content: newMessage,
        timestamp: unixTimestamp,
        type: "admin",
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const result = await response.json();
      if (result.success) {
        // Update local state with the new message
        const newMessageObj = {
          id: result.messageId,
          type: "admin",
          content: newMessage,
          timestamp: unixTimestamp,
          displayTime: new Date(unixTimestamp * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, newMessageObj]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "resolved":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-[#0064B1] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Admin Support Dashboard</h1>
            <p className="text-lg opacity-90">
              Manage and respond to user inquiries
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 h-[700px]">
              {/* Users Sidebar */}
              <div className="col-span-4 border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[calc(700px-73px)]">
                  <div className="space-y-1">
                    {filteredSessions.map((session) => (
                      <div
                        key={session.session_id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedSession?.session_id === session.session_id
                            ? "bg-gray-50"
                            : ""
                        }`}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-[#0064B1] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">
                                {session.user_name}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  session.last_message_at
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {session.user_email}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500 truncate">
                                {session.last_message}
                              </p>
                              <div className="flex items-center">
                                <Circle
                                  className={`h-2 w-2 ${getStatusColor(
                                    session.status
                                  )}`}
                                  fill="currentColor"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Area */}
              <div className="col-span-8">
                {selectedSession ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0064B1] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="font-semibold">
                            {selectedSession.user_name}
                          </h2>
                          <p className="text-sm text-zinc-600">
                            {selectedSession.user_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <ScrollArea className="h-[calc(700px-170px)] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.type === "user"
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            <div
                              className={`flex gap-3 max-w-[80%] ${
                                message.type === "user"
                                  ? ""
                                  : "flex-row-reverse"
                              }`}
                            >
                              {message.type === "user" && (
                                <div className="flex-shrink-0 w-8 h-8 bg-[#0064B1] rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  message.type === "admin"
                                    ? "bg-[#0064B1] text-white"
                                    : message.type === "system"
                                    ? "bg-gray-100 text-zinc-600"
                                    : "bg-gray-100"
                                }`}
                              >
                                <p>{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {message.displayTime ||
                                    new Date(
                                      message.timestamp * 1000
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-grow"
                        />
                        <Button type="submit" className="bg-[#0064B1]">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select a chat to start messaging
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
