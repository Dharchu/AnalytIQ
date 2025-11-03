import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api";
import * as XLSX from "xlsx";
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
import jsPDF from "jspdf";

Chart.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const handleFile = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Reset all states when a new file is selected
      setXAxis(""); // Reset X-axis selection
      setYAxis(""); // Reset Y-axis selection
      setChartData(null);
      setData([]);
      setColumns([]);
      setFileName(file.name);

      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length > 0 && typeof json[0] === 'object') {
          setData(json);
          setColumns(Object.keys(json[0]));
        } else {
          alert("File is empty or has an invalid format. Please ensure it has a header row and data.");
        }
      } catch (error) {
        console.error("File parsing error:", error);
        alert("Failed to parse the Excel file. Please check if the file is corrupted.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const generateChart = async () => {
    if (!xAxis || !yAxis) return alert("Select both X and Y axes");

    try {
      // --- Save analysis to history ---
      const token = localStorage.getItem("token");
      if (token) {
        API.post("/api/chart/history",
          { fileName, xAxis, yAxis, chartType, data },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(res => {
          // Add new history item to the top of the list for immediate UI update
          setHistory(prev => [res.data, ...prev]);
        }).catch(err => {
          // Non-critical error, so just log it
          console.error("Could not save to history:", err);
        });
      }
      // --------------------------------

      // Process data directly on the frontend
      const chartPoints = data
        .filter(item => item[yAxis] != null && !isNaN(parseFloat(item[yAxis])))
        .map(item => ({
          x: item[xAxis],
          y: parseFloat(item[yAxis])
        }));

      // Dynamically generate colors for the pie chart to ensure each slice is unique
      let bgColors = "rgba(37, 99, 235, 0.7)";
      if (chartType === 'pie') {
        bgColors = chartPoints.map((_, index) => {
          const hue = (index * 137.508) % 360; // Use golden angle for distinct colors
          return `hsla(${hue}, 70%, 60%, 0.8)`;
        });
      }

      const formatted = {
        labels: chartPoints.map((i) => i.x),
        datasets: [
          {
            label: `${yAxis} vs ${xAxis}`,
            data: chartPoints.map((i) => i.y),
            backgroundColor: bgColors,
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1,
          },
        ],
      };
      setChartData(formatted);
    } catch (err) {
      console.error("Chart generation error:", err);
      alert("Failed to generate chart from the provided data.");
    }
  };

  const downloadPDF = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const element = document.getElementById("chart-container");
    const canvas = await html2canvas(element);
    const pdf = new jsPDF();
    const img = canvas.toDataURL("image/png");
    pdf.addImage(img, "PNG", 10, 10, 180, 100);
    pdf.save("chart.pdf");
  };

  const downloadPNG = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const element = document.getElementById("chart-container");
    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "chart.png";
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await API.get("/api/chart/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data);
      } catch (err) { console.error("Failed to fetch history", err); }
    };
    fetchHistory();
  }, [navigate]);

  // By using useMemo, we ensure the options object is recreated when dependencies change,
  // forcing the chart to re-render with new axis labels.
  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        // Use state variables which are available in this scope
        text: chartData ? `${yAxis} vs ${xAxis}` : 'Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: yAxis },
      },
      x: { title: { display: true, text: xAxis } },
    },
  }), [xAxis, yAxis, chartData]); // Dependencies for useMemo

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-600">AnalytIQ Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
        <p className="font-bold">Instructions</p>
        <p>1. Upload your own .xls or .xlsx file.</p>
        <p>2. The X and Y axis dropdowns will populate with the column headers from your file.</p>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} className="mb-4" />
      {columns.length > 0 && (
        <div className="flex gap-4 mb-4">
          <select onChange={(e) => setXAxis(e.target.value)} value={xAxis} className="border p-2 rounded">
            <option value="">Select X-Axis</option>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <select onChange={(e) => setYAxis(e.target.value)} value={yAxis} className="border p-2 rounded">
            <option value="">Select Y-Axis</option>
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <select onChange={(e) => setChartType(e.target.value)} value={chartType} className="border p-2 rounded">
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
          <button onClick={generateChart} className="bg-blue-600 text-white px-4 rounded">Generate</button>
        </div>
      )}
      <div id="chart-container" className="bg-white p-4 rounded-lg shadow-md">
        {chartData && chartType === 'bar' && <Bar key={`${xAxis}-${yAxis}-bar`} options={options} data={chartData} />}
        {chartData && chartType === 'line' && <Line key={`${xAxis}-${yAxis}-line`} options={options} data={chartData} />}
        {chartData && chartType === 'pie' && <Pie key={`${xAxis}-${yAxis}-pie`} options={options} data={chartData} />}
        {!chartData && <p className="text-center text-gray-500">Upload a file and generate a chart to see it here.</p>}
      </div>
      {chartData && (
        <div className="mt-4 flex gap-4">
          <button onClick={downloadPNG} className="bg-teal-600 text-white px-4 py-2 rounded">Download PNG</button>
          <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2 rounded">Download PDF</button>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis History</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chart Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X-Axis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Y-Axis</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map(item => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fileName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.chartType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.xAxis}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.yAxis}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="text-center text-gray-500 py-4">No history found.</p>}
        </div>
      </div>
    </div>
  );
}
