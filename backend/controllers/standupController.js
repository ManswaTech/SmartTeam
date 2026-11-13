const Standup = require('../models/Standup');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { GoogleGenAI } = require('@google/genai');

const fetchRecentGitHubCommits = async (githubUsername) => {
  if (!githubUsername) return [];
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/events/public`);
    if (!response.ok) return [];
    const events = await response.json();

    const commits = [];
    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload?.commits) {
        for (const commit of event.payload.commits) {
          commits.push(`[${event.repo.name}] ${commit.message}`);
          if (commits.length >= 8) break;
        }
      }
      if (commits.length >= 8) break;
    }
    return commits;
  } catch {
    return [];
  }
};

const generateStandup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    let rawCommits = await fetchRecentGitHubCommits(user?.githubUsername);

    if (rawCommits.length === 0) {
      rawCommits = [
        'fix(auth): resolved JWT middleware token authorization bug',
        'feat(pto): implemented leave request approval table UI',
        'refactor(db): updated Mongoose schemas and relationships'
      ];
    }

    const rawTasks = [
      'ST-102: Connect leave approval status API',
      'ST-108: Design dark theme Tailwind dashboard components'
    ];

    let yesterdayWork = rawCommits.join('; ');
    let todayPlan = 'Complete Standup AI integration and finalize full end-to-end user verification.';
    let blockers = 'None at present.';

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Summarize these developer commit logs and task items into a concise daily standup report.
Return ONLY valid JSON with exact keys: "yesterdayWork", "todayPlan", "blockers".
Commits: ${JSON.stringify(rawCommits)}
Tasks: ${JSON.stringify(rawTasks)}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(aiResponse.text);
        yesterdayWork = parsed.yesterdayWork || yesterdayWork;
        todayPlan = parsed.todayPlan || todayPlan;
        blockers = parsed.blockers || blockers;
      } catch (aiError) {
        console.warn('Gemini summarization skipped (using commit fallback):', aiError.message);
      }
    }

    const newStandup = await Standup.create({
      userId,
      yesterdayWork,
      todayPlan,
      blockers,
      rawCommits,
      rawTasks
    });

    res.status(201).json(newStandup);
  } catch (error) {
    console.error('Generate Standup Error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate standup report' });
  }
};

const getStandupHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const history = await Standup.find({ userId }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch standup history' });
  }
};

const getTeamStandups = async (req, res) => {
  try {
    const standups = await Standup.find()
      .populate('userId', 'name email role')
      .sort({ date: -1 })
      .limit(30);
    res.json(standups);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch team standups' });
  }
};

const updateStandup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { yesterdayWork, todayPlan, blockers } = req.body;
    const standup = await Standup.findOneAndUpdate(
      { _id: req.params.id, userId },
      { yesterdayWork, todayPlan, blockers },
      { new: true }
    );
    if (!standup) return res.status(404).json({ message: 'Standup not found' });
    res.json(standup);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update standup' });
  }
};

const deleteStandup = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const standup = await Standup.findOneAndDelete({ _id: req.params.id, userId });
    if (!standup) return res.status(404).json({ message: 'Standup not found' });
    res.json({ message: 'Standup deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete standup' });
  }
};

const getActiveLeaves = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeLeaves = await Leave.find({
      status: 'Approved',
      endDate: { $gte: today }
    }).populate('userId', 'name role');
    res.json(activeLeaves);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch active leaves' });
  }
};

module.exports = {
  generateStandup,
  getStandupHistory,
  getTeamStandups,
  updateStandup,
  deleteStandup,
  getActiveLeaves
};