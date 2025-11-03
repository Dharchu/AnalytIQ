import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Tooltip, Legend, Title);

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  const [currentItem, setCurrentItem] = useState(null); // To hold the item being edited in the modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
        alert('Could not fetch users. You may not be an admin.');
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (historyId) => {
    if (!window.confirm("Are you sure you want to permanently delete this history record?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/chart/history/${historyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the deleted item from the state to update the UI
      setUserHistory(userHistory.filter(item => item._id !== historyId));
      alert('History record deleted successfully!');
    } catch (error) {
      console.error('Failed to delete history record', error);
      alert('Could not delete the record.');
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setEditFormData({
      ...item, // Pre-fill with all item data
      fileName: item.fileName,
      chartType: item.chartType,
      xAxis: item.xAxis,
      yAxis: item.yAxis,
    });
  };

  const handleCancel = () => {
    setCurrentItem(null);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentItem) return;
    const historyId = currentItem._id;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/chart/history/${historyId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserHistory(userHistory.map(item => (item._id === historyId ? res.data : item)));
      setCurrentItem(null);
      alert('History record updated successfully!');
    } catch (error) {
      console.error('Failed to update history record', error);
      alert('Could not update the record.');
    }
  };

  const handleViewUserHistory = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/chart/history/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserHistory(res.data);
      setSelectedUser(user);
    } catch (error) {
      console.error(`Failed to fetch history for ${user.username}`, error);
      alert(`Could not fetch history for ${user.username}.`);
    }
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setUserHistory([]);
  };

  // Memoized chart data for the modal
  const modalChartData = useMemo(() => {
    if (!currentItem || !editFormData.xAxis || !editFormData.yAxis) return null;

    const chartPoints = currentItem.data
      .filter(item => item[editFormData.yAxis] != null && !isNaN(parseFloat(item[editFormData.yAxis])))
      .map(item => ({
        x: item[editFormData.xAxis],
        y: parseFloat(item[editFormData.yAxis])
      }));

    return {
      labels: chartPoints.map((i) => i.x),
      datasets: [
        {
          label: `${editFormData.yAxis} vs ${editFormData.xAxis}`,
          data: chartPoints.map((i) => i.y),
          backgroundColor: editFormData.chartType === 'pie' ? ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] : "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  }, [currentItem, editFormData]);

  const modalChartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Chart Preview' } } };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Main Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Logout</button>
      </div>

      {/* Conditional Rendering: Show User List or User History */}
      {!selectedUser ? (
        // --- User List View ---
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-gray-800 p-4">All Users</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Analyses Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.analysisCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleViewUserHistory(user)} className="text-indigo-600 hover:text-indigo-900">
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // --- User History View ---
        <div>
          <div className="flex items-center mb-4">
            <button onClick={handleBackToUsers} className="text-indigo-600 hover:text-indigo-900 mr-4">← Back to Users</button>
            <h2 className="text-2xl font-semibold text-gray-800">History for <span className="text-blue-600">{selectedUser.username}</span></h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chart Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">X-Axis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Y-Axis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userHistory.map(item => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.chartType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.xAxis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.yAxis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userHistory.length === 0 && <p className="text-center text-gray-500 py-4">No history found for this user.</p>}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {currentItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-4/5 max-w-6xl">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit History Record</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Form Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">File Name</label>
                  <input type="text" name="fileName" value={editFormData.fileName} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chart Type</label>
                  <select name="chartType" value={editFormData.chartType} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    <option value="pie">Pie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">X-Axis</label>
                  <select name="xAxis" value={editFormData.xAxis} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                    {currentItem.data && Object.keys(currentItem.data[0]).map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Y-Axis</label>
                  <select name="yAxis" value={editFormData.yAxis} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                    {currentItem.data && Object.keys(currentItem.data[0]).map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              </div>
              {/* Chart Preview Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {modalChartData ? (
                  <>
                    {editFormData.chartType === 'bar' && <Bar options={modalChartOptions} data={modalChartData} />}
                    {editFormData.chartType === 'line' && <Line options={modalChartOptions} data={modalChartData} />}
                    {editFormData.chartType === 'pie' && <Pie options={modalChartOptions} data={modalChartData} />}
                  </>
                ) : (
                  <p className="text-center text-gray-500">Select valid axes to see chart preview.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={handleCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}