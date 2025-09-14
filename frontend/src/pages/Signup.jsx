
import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Signup.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const validatePassword = (password) => {
    // Minimum 8 chars, at least one letter and one number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error('Username is required.');
      return;
    }
    if (!validateEmail(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(form.password)) {
      toast.error('Password must be at least 8 characters and contain letters and numbers.');
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/signup`, form);
      login(res.data);
      toast.success('Signup successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Signup failed.');
    }
  };

  return (
    <div className="signup-page">
      <form onSubmit={handleSubmit} className="signup-container">
        <h2>Create Your Account</h2>

        <div className="input-group">
          <input name="username" onChange={handleChange} placeholder=" " required value={form.username} />
          <label>Username</label>
        </div>

        <div className="input-group">
          <input name="email" type="email" onChange={handleChange} placeholder=" " required value={form.email} />
          <label>Email</label>
        </div>

        <div className="input-group">
          <input name="password" type="password" onChange={handleChange} placeholder=" " required value={form.password} />
          <label>Password</label>
        </div>

        <button>Sign Up</button>
      </form>
      {/* Toast container for popups */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
