import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 👈 Use full backend URL during development
});

export default API;
