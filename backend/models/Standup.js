const mongoose = require('mongoose');

const StandupSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  yesterdayWork: { 
    type: String, 
    required: true 
  },
  todayPlan: { 
    type: String, 
    required: true 
  },
  blockers: { 
    type: String, 
    default: 'None' 
  },
  rawCommits: [{ type: String }],
  rawTasks: [{ type: String }],
  teamsPosted: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Standup', StandupSchema);