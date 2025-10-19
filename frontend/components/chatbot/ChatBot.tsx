"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { usePathname } from "next/navigation";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type UserRole = "patient" | "doctor" | "hospital" | "public";

interface UserContext {
  role: UserRole;
  userId: number | null;
  sessionToken: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Generate session token once on mount (persists until page refresh)
  const sessionToken = useMemo(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }, []);

  // Detect user role and ID based on current route
  const userContext = useMemo((): UserContext => {
    if (pathname.startsWith("/patient")) {
      // Patient role - ID 1 (Rajesh Kumar)
      return {
        role: "patient",
        userId: 1,
        sessionToken,
      };
    } else if (pathname.startsWith("/doctor")) {
      // Doctor role - ID 1 (Dr. Sarah Johnson)
      return {
        role: "doctor",
        userId: 1,
        sessionToken,
      };
    } else if (pathname.startsWith("/hospital")) {
      // Hospital role - ID 1 (City General Hospital)
      return {
        role: "hospital",
        userId: 1,
        sessionToken,
      };
    } else {
      // Public/guest access
      return {
        role: "public",
        userId: null,
        sessionToken,
      };
    }
  }, [pathname, sessionToken]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5678/webhook/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: inputValue,
          timestamp: new Date().toISOString(),
          userContext: {
            role: userContext.role,
            userId: userContext.userId,
            sessionToken: userContext.sessionToken,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to get response as text first, then parse
      const responseText = await response.text();
      let botText = "";
      
      try {
        // Try to parse as JSON
        const data = JSON.parse(responseText);
        
        // Extract response text from various possible formats
        if (typeof data === "string") {
          botText = data;
        } else if (data.output) {
          botText = data.output;
        } else if (data.response) {
          botText = data.response;
        } else if (data.text) {
          botText = data.text;
        } else if (data.message) {
          botText = data.message;
        } else {
          botText = JSON.stringify(data, null, 2);
        }
      } catch (jsonError) {
        // If JSON parsing fails, use the text response directly
        botText = responseText || "I received your message but couldn't process the response format.";
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      let errorText = "Sorry, I couldn't connect to the server. Please try again.";
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorText = "Unable to reach the AI server. Please check if n8n is running on http://localhost:5678";
      } else if (error instanceof Error) {
        errorText = `Error: ${error.message}. Please check the console for details.`;
      }
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "380px",
        height: "500px",
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <MessageCircle size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              CloudCare AI Assistant
            </h3>
            <p style={{ margin: 0, fontSize: "11px", opacity: 0.8 }}>
              {userContext.role === "patient" && "Patient Portal"}
              {userContext.role === "doctor" && "Doctor Portal"}
              {userContext.role === "hospital" && "Hospital Portal"}
              {userContext.role === "public" && "Guest Mode"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "#f9fafb",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              marginTop: "40px",
              padding: "0 20px",
            }}
          >
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>
              👋 Hi! How can I help you today?
            </p>
            <p style={{ fontSize: "12px", opacity: 0.7 }}>
              {userContext.role === "patient" && "Ask about your health records, appointments, or prescriptions"}
              {userContext.role === "doctor" && "Ask about your patients, schedules, or medical records"}
              {userContext.role === "hospital" && "Ask about hospital resources, staff, or emergency cases"}
              {userContext.role === "public" && "Ask general healthcare questions"}
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor:
                  message.sender === "user" ? "#3b82f6" : "white",
                color: message.sender === "user" ? "white" : "#1f2937",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>
                {message.text}
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "11px",
                  opacity: 0.7,
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "white",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#9ca3af",
                    animation: "bounce 1.4s infinite ease-in-out",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#9ca3af",
                    animation: "bounce 1.4s infinite ease-in-out 0.2s",
                  }}
                />
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#9ca3af",
                    animation: "bounce 1.4s infinite ease-in-out 0.4s",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "white",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 16px",
              cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim() && !isLoading) {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6";
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}