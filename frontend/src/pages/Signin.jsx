import { useState, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/signin.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Signin() {
  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!validateEmail(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(form.password)) {
      toast.error('Password must be at least 8 characters and contain letters and numbers.');
      return;
    }
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/signin`, form);
      if (res.data.token && res.data.user?.id) {
        login(res.data);
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid login response.');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed.');
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
            value={form.email}
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
            value={form.password}
          />
          <label>Password</label>
        </div>

        <button>Sign In</button>
      </form>
      {/* Toast container for popups */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
