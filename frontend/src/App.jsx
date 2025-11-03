import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
       <Route path="/signup" element={<Signup />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Welcome to AnalytIQ</h1>
      <div className="flex gap-4">
        <button onClick={() => navigate("/login")} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          Login
        </button>
        <button onClick={() => navigate("/admin/login")} className="bg-red-600 text-white px-6 py-2 rounded-lg">
          Admin Login
        </button>
      </div>
    </div>
  );
}
