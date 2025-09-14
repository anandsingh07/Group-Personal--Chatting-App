import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import '../styles/ChatRoom.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const socket = io(BACKEND_URL);

export default function ChatRoom({ roomId, user, isGroup, receiverId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [nicknameMap, setNicknameMap] = useState({});

  useEffect(() => {
    if (!roomId || !user?.user?.id || (!isGroup && !receiverId)) {
      console.error('❌ Invalid props:', { roomId, user, isGroup, receiverId });
      return;
    }

    socket.emit("joinRoom", roomId, isGroup);

    const fetchNicknames = async () => {
      if (!isGroup) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/groups/${roomId}`, {
          headers: { Authorization: user.token },
        });
        const data = await res.json();
        const map = {};
        data.groupMembers.forEach((member) => {
          map[member.user] = member.nickname;
        });
        setNicknameMap(map);
      } catch (err) {
        console.error("❌ Nickname fetch error:", err.message);
      }
    };

    const fetchOldMessages = async () => {
      try {
        const endpoint = isGroup
          ? `${BACKEND_URL}/api/messages/group/${roomId}`
          : `${BACKEND_URL}/api/messages/personal/${receiverId}`;
        const res = await fetch(endpoint, {
          headers: { Authorization: user.token },
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to fetch old messages:", err.message);
      }
    };

    fetchNicknames();
    fetchOldMessages();

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("initialMessages", (msgs) => {
      setMessages(msgs);
    });

    socket.on("chatCleared", () => setMessages([]));

    return () => {
      socket.off("newMessage");
      socket.off("initialMessages");
      socket.off("chatCleared");
    };
  }, [roomId, user, isGroup, receiverId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (!user?.user?.id) {
      console.error("❌ Cannot send message: senderId is undefined");
      return;
    }

    socket.emit("sendMessage", {
      roomId,
      senderId: user.user.id,
      text: input,
      isGroup,
      receiverId: receiverId || null,
    });
    setInput("");
  };

  const clearChat = () => {
    if (!user?.user?.id) return;

    socket.emit("clearChat", {
      roomId,
      isGroup,
      receiverId: receiverId || null,
    });

    setMessages([]); 
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-header">
        <h2 className="chatroom-title">{isGroup ? "Group Chat" : "Friend Chat"}</h2>
        <button onClick={clearChat} className="clear-btn">Clear Chat</button>
      </div>

      <div className="messages-box">
        {messages.map((m, idx) => {
          const isSender = m.sender === user.user.id || m.sender?._id === user.user.id;
          const name = isGroup
            ? m.nickname || nicknameMap[m.sender?._id || m.sender] || m.username || "Unknown"
            : isSender
            ? "You"
            : m.username || "Friend";
          const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "";

          return (
            <div key={idx} className={`message ${isSender ? "message-right" : "message-left"}`}>
              <div className="message-bubble">
                <p className="sender-info">{name} · {time}</p>
                <p>{m.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="input-area">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="send-btn">Send</button>
      </div>
    </div>
  );
}
