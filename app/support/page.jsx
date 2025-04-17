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
  HeadphonesIcon,
  Clock,
  MessageSquare,
  Phone,
  Mail,
} from "lucide-react";

// WebSocket Boilerplate Code (Not in use)
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

export default function SupportPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchChatHistory = async (userId) => {
    try {
      const response = await fetch(`/api/chat?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/current-user");
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          if (userData.userId) {
            fetchChatHistory(userData.userId);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    getUser();
  }, []);

  // Function to fetch new messages
  const fetchNewMessages = async () => {
    if (!currentUser?.userId) return;

    try {
      const response = await fetch(`/api/chat?userId=${currentUser.userId}`);
      const data = await response.json();

      if (data.success) {
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }

        if (data.messages.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1];

          // Only update if we have new messages
          if (!lastMessageId || lastMsg.id > lastMessageId) {
            setMessages(data.messages);
            setLastMessageId(lastMsg.id);
            scrollToBottom();
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Set up polling for new messages
  useEffect(() => {
    if (currentUser?.userId) {
      // Initial fetch
      fetchNewMessages();

      // Set up polling interval
      const interval = setInterval(fetchNewMessages, 2000); // Poll every 2 seconds

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [currentUser]); // Depend on user to restart polling if user changes

  // Scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.userId) return;

    const timestamp = Math.floor(Date.now() / 1000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.userId,
          content: newMessage,
          timestamp: timestamp,
          type: "user",
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const result = await response.json();
      if (result.success) {
        setNewMessage("");
        // The message will be fetched by the polling mechanism
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Support Chat
            </h2>
          </div>

          <div className="h-[600px] flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        message.type === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {message.type === "agent" && (
                        <div className="flex-shrink-0 w-8 h-8 bg-[#0064B1] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-[#0064B1] text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.displayTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:border-[#0064B1]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0064B1] text-white rounded-lg hover:bg-[#004f8a] transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
