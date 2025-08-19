import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import ChatRoom from './ChatRoom';

export default function ChatRoomWrapper({ isGroup }) {
  const { groupId, friendId } = useParams();
  const { user } = useContext(AuthContext);

  if (!user) return <p className="p-4 text-center">Please login to chat</p>;

  return (
    <ChatRoom
      roomId={isGroup ? groupId : friendId}
      receiverId={isGroup ? null : friendId}
      isGroup={isGroup}
      user={user}
    />
  );
}
