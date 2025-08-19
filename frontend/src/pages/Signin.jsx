import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/signin.css';

export default function Signin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signin', form);
      console.log('Login API response:', JSON.stringify(res.data, null, 2));
      if (res.data.token && res.data.user?.id) {
        login(res.data);
        navigate('/');
      } else {
        console.error('❌ Invalid login response:', res.data);
      }
    } catch (err) {
      console.error('❌ Login error:', err.response?.data || err.message);
    }
  };

  return (
    <div className="signin-page">
      <form onSubmit={handleSubmit} className="signin-container">
        <h2>Sign In</h2>

        <div className="input-group">
          <input
            name="email"
            type="email"
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input
            name="password"
            type="password"
            onChange={handleChange}
            placeholder=" "
            required
          />
          <label>Password</label>
        </div>

        <button>Sign In</button>
      </form>
    </div>
  );
}