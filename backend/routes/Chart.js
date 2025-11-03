import express from "express";
import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET api/chart/history
// @desc    Get user's analysis history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/chart/history
// @desc    Save a new analysis
// @access  Private
router.post("/history", auth, async (req, res) => {
  const { fileName, xAxis, yAxis, chartType, data } = req.body;

  try {
    const newAnalysis = new Analysis({
      user: req.user.id,
      fileName,
      xAxis,
      yAxis,
      chartType,
      data,
    });

    const analysis = await newAnalysis.save();

    // Increment user's analysis count
    await User.findByIdAndUpdate(req.user.id, { $inc: { analysisCount: 1 } });
    res.json(analysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/chart/history/all
// @desc    Get all users' analysis history (Admin only)
// @access  Private/Admin
router.get("/history/all", [auth, admin], async (req, res) => {
  try {
    const history = await Analysis.find({})
      .populate('user', 'username') // Get username from User model
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/chart/history/user/:userId
// @desc    Get a specific user's analysis history (Admin only)
// @access  Private/Admin
router.get("/history/user/:userId", [auth, admin], async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.params.userId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/chart/history/:id
// @desc    Delete an analysis history record (Admin only)
// @access  Private/Admin
router.delete("/history/:id", [auth, admin], async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }
    await analysis.deleteOne();
    res.json({ message: 'Analysis record removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/chart/history/:id
// @desc    Update an analysis history record (Admin only)
// @access  Private/Admin
router.put("/history/:id", [auth, admin], async (req, res) => {
  const { fileName, chartType, xAxis, yAxis } = req.body;

  try {
    let analysis = await Analysis.findById(req.params.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }

    analysis.fileName = fileName ?? analysis.fileName;
    analysis.chartType = chartType ?? analysis.chartType;
    analysis.xAxis = xAxis ?? analysis.xAxis;
    analysis.yAxis = yAxis ?? analysis.yAxis;

    await analysis.save();
    const updatedAnalysis = await Analysis.findById(analysis._id).populate('user', 'username');
    res.json(updatedAnalysis);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;
