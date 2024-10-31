import { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); 

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatBoxProps {
  selectedContactId: string;
  selectedContactEmail: string;
}

export default function ChatBox({ selectedContactId, selectedContactEmail }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const userId = localStorage.getItem("user_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchChatHistory = async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `http://localhost:3000/messages/${selectedContactId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(data);
      const unreadMessages = data.filter(
        (msg: Message) => !msg.isRead && msg.sender === selectedContactId
      );
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg:any) => msg._id);
        markMessagesAsRead(messageIds);
      }
    };

    if (selectedContactId) {
      fetchChatHistory();
    }

    socket.on("messageReceived", (message: Message) => {
      if (message.sender === selectedContactId || message.recipient === userId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on("messageRead", ({ messageIds }: { messageIds: string[] }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    });

    return () => {
      socket.off("messageReceived");
      socket.off("messageRead");
    };
  }, [selectedContactId]);

  const markMessagesAsRead = async (messageIds: string[]) => {
    try {
      await axios.post(
        `http://localhost:3000/messages/mark-as-read`,
        {
          messageIds,
          recipientId: localStorage.getItem("user_id"),
          senderId: selectedContactId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("markAsRead", {
        messageIds,
        recipientId: userId,
        senderId: selectedContactId,
      });

   
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const { data } = await axios.post(
      "http://localhost:3000/messages",
      { recipientId: selectedContactId, content: newMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages([...messages, data]);
    setNewMessage("");
  };

  return (
    <div
      className="chatbox border p-3"
      style={{ height: "400px", overflowY: "scroll" }}
    >
      <h4>Chat with {selectedContactEmail || "Select a contact"}</h4>
      {messages.map((msg) => (
        <div key={msg._id} className="mb-2">
          <p>{msg.content}</p>
          <small className="text-muted">
            {msg.isRead ? "Viewed" : "Received"} - {new Date(msg.createdAt).toLocaleString()}
          </small>
          <br />
          <small className="text-muted">
            {msg.sender === selectedContactId ? `${selectedContactEmail} (Sent)` : "You (Sent)"}
          </small>
        </div>
      ))}

      {selectedContactId && (
        <div className="mt-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="form-control"
          />
          <button onClick={handleSendMessage} className="btn btn-primary mt-2">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
