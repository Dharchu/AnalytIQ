import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  xAxis: {
    type: String,
    required: true,
  },
  yAxis: {
    type: String,
    required: true,
  },
  chartType: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('Analysis', AnalysisSchema);