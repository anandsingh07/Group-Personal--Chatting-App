import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Friends() {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/users/friends`, {
        headers: { Authorization: user.token }
      });
      setFriends(res.data.friends);
      setReceived(res.data.received);
      setSent(res.data.sent);
    };
    fetch();
  }, [user.token]);

  const acceptRequest = async (fromId) => {
    await axios.post(
      `${BACKEND_URL}/api/users/accept-request`,
      { fromId },
      { headers: { Authorization: user.token } }
    );
    window.location.reload();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Friends</h2>
      {friends.map(f => (
        <div key={f._id} className="flex justify-between items-center border p-2 rounded mb-2">
          <span>{f.username} ({f.userId})</span>
          <button onClick={() => navigate(`/personal-chat/${f._id}`)} className="bg-blue-600 text-white px-2 py-1 rounded">
            Chat
          </button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">Friend Requests</h2>
      {received.map(r => (
        <div key={r._id} className="flex justify-between items-center border p-2 rounded mb-2">
          <span>{r.username} ({r.userId})</span>
          <button onClick={() => acceptRequest(r._id)} className="bg-green-600 text-white px-2 py-1 rounded">
            Accept
          </button>
        </div>
      ))}

      <h2 className="text-xl font-bold mt-6 mb-2">Sent Requests</h2>
      {sent.map(s => (
        <div key={s._id} className="border p-2 rounded mb-2">
          <span>{s.username} ({s.userId}) - pending</span>
        </div>
      ))}
    </div>
  );
}
