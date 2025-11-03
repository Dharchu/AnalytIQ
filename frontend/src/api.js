import axios from 'axios';

const API = axios.create({
  // In production, the frontend and backend are on the same domain.
  // A relative URL '/' will correctly point to the Render service URL.
  baseURL: '/',
});

export default API;