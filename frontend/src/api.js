import axios from 'axios';

const API = axios.create({
  // During development, this will be empty. In production (on Netlify), 
  // we will set VITE_API_URL to your live backend URL on Render.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export default API;