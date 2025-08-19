import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import CreateGroup from './pages/CreateGroup';
import UserSearch from './pages/UserSearch';
import GroupList from './pages/GroupList';
import ChatRoomWrapper from './components/ChatRoomWrapper'; 
import FriendsChatRoom from './components/FriendsChatRoom';
import Friends from './pages/Friends';
import Navbar from './components/Navbar';

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public routes */}
        {!user && (
          <>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            {/* Redirect all other paths to signin */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </>
        )}

        {/* Protected routes */}
        {user && (
          <>
            <Route path="/" element={<GroupList />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/search-user" element={<UserSearch />} />
            <Route path="/group-chat/:groupId" element={<ChatRoomWrapper isGroup={true} />} />
            <Route path="/personal-chat/:friendId" element={<FriendsChatRoom />} />
            <Route path="/friends" element={<Friends />} />
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
