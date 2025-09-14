
import { useRef, useState, useEffect, useContext } from 'react';
import { connectSocket } from '../socket';
import { AuthContext } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../styles/Friends.css';

export default function FriendsChatRoom() {
  const { friendId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  const roomId = [user?.user?.id, friendId].sort().join('-');

  const ensureSocketConnected = () => {
    if (!socketRef.current) {
      socketRef.current = connectSocket();
      socketRef.current.emit('joinRoom', roomId, false);
      socketRef.current.on('newMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
      socketRef.current.on('chatCleared', () => setMessages([]));
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !user?.user?.id || !friendId) return;
    ensureSocketConnected();
    socketRef.current.emit('sendMessage', {
      roomId,
      senderId: user.user.id,
      text: input,
      isGroup: false,
      receiverId: friendId,
    });
    setInput('');
  };

  const clearChat = () => {
    ensureSocketConnected();
    socketRef.current.emit('clearChat', {
      roomId,
      isGroup: false,
      receiverId: friendId,
    });
    setMessages([]);
  };

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('chatCleared');
        socketRef.current.emit('leaveRoom', roomId);
      }
      setMessages([]);
    };
  }, [roomId]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Friend Chat</h2>
        <button onClick={clearChat}>Clear Chat</button>
      </div>

      <div className="chat-box">
        {messages.map((m, i) => {
          const isSender = m.sender === user.user.id;
          const senderName = isSender ? 'You' : 'Friend';
          const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : '';

          return (
            <div key={i} className={`message ${isSender ? 'sent' : 'received'}`}>
              <div className="message-meta">{senderName} · {time}</div>
              <div className="message-content">{m.content}</div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
