import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [searchId, setSearchId] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchId.trim() !== '') {
      navigate(`/search-user?id=${searchId}`);
      setSearchId('');
      setMenuOpen(false); 
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">ChatHUB</Link>
          <Link to="/friends" className="navbar-link">Friends</Link>
          {user && <span className="navbar-userid">ID: {user.user.userId}</span>}
        </div>

        
        {user && (
          <div className="navbar-search">
            <input
              type="text"
              placeholder="🔍 Search User ID or Group Name"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        )}

        
        <div className="navbar-right">
          <Link to="/create-group">
            <button
              className={`btn ${user ? 'btn-primary' : 'btn-disabled'}`}
              disabled={!user}
            >
              + Group
            </button>
          </Link>

          {!user ? (
            <>
              <Link to="/signin" className="btn btn-blue">Sign In</Link>
              <Link to="/signup" className="btn btn-green">Sign Up</Link>
            </>
          ) : (
            <button onClick={logout} className="btn btn-red">Logout</button>
          )}
        </div>

      
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✖' : '☰'}
        </button>
      </div>

    
      {menuOpen && (
        <div className="navbar-mobile">
          <Link to="/friends" className="navbar-link" onClick={() => setMenuOpen(false)}>Friends</Link>
          
          {user && (
            <>
              <span className="navbar-userid">ID: {user.user.userId}</span>
              <input
                type="text"
                placeholder="🔍 Search User ID or Group"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={handleSearch}
              />
            </>
          )}

          <Link to="/create-group">
            <button
              className={`btn ${user ? 'btn-primary' : 'btn-disabled'}`}
              disabled={!user}
              onClick={() => setMenuOpen(false)}
            >
              + Group
            </button>
          </Link>

          {!user ? (
            <>
              <Link to="/signin" className="btn btn-blue" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/signup" className="btn btn-green" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          ) : (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="btn btn-red"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
