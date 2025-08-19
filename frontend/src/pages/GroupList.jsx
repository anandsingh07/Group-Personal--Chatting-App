import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/GroupList.css'; 

export default function GroupList() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [formState, setFormState] = useState({});
  const [loadingGroupId, setLoadingGroupId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/groups')
      .then(res => setGroups(res.data))
      .catch(() => alert('Failed to load groups'));
  }, []);

  const joinGroup = async (groupId) => {
    const data = formState[groupId];
    if (!data?.passcode || !data?.nickname) {
      alert('Please enter both passcode and nickname');
      return;
    }

    setLoadingGroupId(groupId);

    try {
      await axios.post(
        'http://localhost:5000/api/groups/join',
        {
          groupId,
          passcode: data.passcode,
          nickname: data.nickname,
        },
        { headers: { Authorization: user.token } }
      );
      navigate(`/group-chat/${groupId}`);
    } catch (err) {
      alert('Failed to join: ' + (err.response?.data?.msg || 'Unknown error'));
    } finally {
      setLoadingGroupId(null);
    }
  };

  const handleInputChange = (groupId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="group-list-container">
    

      <div className="joined-groups-container">
        {groups.map(group => (
          <div key={group._id} className="group-card">
            <img
              src={group.image}
              alt={`${group.name} Group`}
              className="group-card-image"
            />
            <h3>{group.name}</h3>

            {user ? (
              <>
                <input
                  type="text"
                  placeholder="Nickname"
                  value={formState[group._id]?.nickname || ''}
                  onChange={(e) => handleInputChange(group._id, 'nickname', e.target.value)}
                />

               <br>
               
               </br>
                <input
                  type="password"
                  placeholder="Passcode"
            
                  value={formState[group._id]?.passcode || ''}
                  onChange={(e) => handleInputChange(group._id, 'passcode', e.target.value)}
                />
                <br>
                </br>
                <button
                  disabled={loadingGroupId === group._id}
                  onClick={() => joinGroup(group._id)}
                >
                  {loadingGroupId === group._id ? 'Joining...' : 'Join'}
                </button>
              </>
            ) : (
              <button disabled>Sign in to Join</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
