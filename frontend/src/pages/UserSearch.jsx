import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function UserSearch() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('id') || '';
  const [targetUser, setTargetUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState('');
  const [passcode, setPasscode] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const search = async () => {
      if (!query) return;
      setStatus('Searching...');
      setTargetUser(null);
      setGroups([]);

      try {
        const userRes = await axios.get(`http://localhost:5000/api/users/search/${query}`, {
          headers: { Authorization: user.token },
        });
        setTargetUser(userRes.data);
        setStatus('');
      } catch {
        try {
          const groupRes = await axios.get(`http://localhost:5000/api/groups/search/${query}`, {
            headers: { Authorization: user.token },
          });
          if (groupRes.data.length === 0) {
            setStatus('No group found');
          } else {
            setGroups(groupRes.data);
            setStatus('');
          }
        } catch {
          setStatus('No user or group found');
        }
      }
    };

    search();
  }, [query, user.token]);

  const sendRequest = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/users/send-request',
        { targetId: targetUser._id },
        { headers: { Authorization: user.token } }
      );
      setStatus('Request sent');
    } catch (err) {
      setStatus(err.response?.data?.msg || 'Failed');
    }
  };

  const joinGroup = async (groupId) => {
    if (!nickname || !passcode) return alert('Please enter both nickname and passcode');
    try {
      await axios.post(
        'http://localhost:5000/api/groups/join',
        { groupId, passcode, nickname },
        { headers: { Authorization: user.token } }
      );
      alert('Joined group successfully!');
      navigate(`/group-chat/${groupId}`);
    } catch (err) {
      setStatus(err.response?.data?.msg || 'Failed to join group');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {targetUser && (
        <div className="border p-4 rounded shadow mb-4">
          <p>Username: <strong>{targetUser.username}</strong></p>
          <p>User ID: {targetUser.userId}</p>
          <button
            onClick={sendRequest}
            className="mt-2 bg-green-600 text-white px-4 py-1 rounded w-full"
          >
            Send Friend Request
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group._id} className="border p-4 rounded shadow mb-4">
          <p><strong>Group Name:</strong> {group.name}</p>
          <img src={group.image} alt="Group" className="w-full h-32 object-cover rounded mt-2" />
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="mt-2 w-full p-2 border rounded"
          />
          <input
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter Group Passcode"
            className="mt-2 w-full p-2 border rounded"
          />
          <button
            onClick={() => joinGroup(group._id)}
            className="mt-2 bg-green-600 text-white px-4 py-1 rounded w-full"
          >
            Join Group
          </button>
        </div>
      ))}

      {status && <p className="mt-4 text-center text-sm text-red-500">{status}</p>}
    </div>
  );
}
