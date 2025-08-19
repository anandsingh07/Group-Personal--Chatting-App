import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/api/auth/signup', form);
    login(res.data);
    navigate('/');
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} className="signup-container">
        <h2>Create Your Account</h2>

        <div className="input-group">
          <input name="username" onChange={handleChange} placeholder=" " required />
          <label>Username</label>
        </div>

        <div className="input-group">
          <input name="email" type="email" onChange={handleChange} placeholder=" " required />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input name="password" type="password" onChange={handleChange} placeholder=" " required />
          <label>Password</label>
        </div>

        <button>Sign Up</button>
      </form>
    </div>
  );
}
