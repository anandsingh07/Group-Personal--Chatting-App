import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import '../styles/Friends.css';

const socket = io('http://localhost:5000'); // singleton socket

export default function FriendsChatRoom() {
  const { friendId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const roomId = [user?.user?.id, friendId].sort().join('-');

  useEffect(() => {
    if (!friendId || !user?.user?.id) return;

    // Join personal chat room
    socket.emit('joinRoom', roomId, false);

    // Listen for new messages only
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('chatCleared', () => setMessages([]));

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('chatCleared');
      socket.emit('leaveRoom', roomId);
      setMessages([]); // clear frontend memory on unmount
    };
  }, [friendId, user, roomId]);

  const sendMessage = () => {
    if (!input.trim() || !user?.user?.id || !friendId) return;

    socket.emit('sendMessage', {
      roomId,
      senderId: user.user.id,
      text: input,
      isGroup: false,
      receiverId: friendId,
    });

    setInput(''); // only clear input, don't add to messages locally
  };

  const clearChat = () => {
    setMessages([]); // clears only frontend
  };

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
