import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateGroup.css'; 

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function CreateGroup() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', passcode: '', image: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(
      `${BACKEND_URL}/api/groups/create`,
      form,
      { headers: { Authorization: user.token } }
    );
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="create-group-form">
      <h2>Create a New Group</h2>
      <input
        name="name"
        placeholder="Group Name"
        required
        onChange={handleChange}
      />
      <input
        name="passcode"
        placeholder="Passcode"
        required
        onChange={handleChange}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        required
      />
      <button type="submit">Create Group</button>
    </form>
  );
}
