import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function StandupDashboard() {
  const [history, setHistory] = useState([]);
  const [teamFeed, setTeamFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('mine');
  const [activeLeaves, setActiveLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ yesterdayWork: '', todayPlan: '', blockers: '' });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const [histRes, teamRes, leaveRes] = await Promise.all([
        API.get('/standups/history'),
        API.get('/standups/team'),
        API.get('/standups/active-leaves')
      ]);
      setHistory(histRes.data);
      setTeamFeed(teamRes.data);
      setActiveLeaves(leaveRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      await API.post('/standups/generate');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      yesterdayWork: item.yesterdayWork,
      todayPlan: item.todayPlan,
      blockers: item.blockers
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await API.put(`/standups/${id}`, editForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update standup');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/standups/${id}`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete standup');
    }
  };

  const displayedList = activeTab === 'mine' ? history : teamFeed;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">AI Daily StandUp Reporter</h2>
          <p className="text-xs text-slate-400 mt-1">Aggregates daily progress from commit logs & task items. Edit or customize anytime.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'mine' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              My Standups
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'team' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Team Feed ({teamFeed.length})
            </button>
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition duration-200 shadow-lg shadow-indigo-600/25 disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {loading ? 'Generating...' : "Generate Today's Report"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {activeLeaves.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Out of Office / Approved PTO:</span>
          {activeLeaves.map((leave) => (
            <span key={leave._id} className="text-xs bg-slate-900 border border-slate-800 text-slate-200 px-3 py-1 rounded-full">
              {leave.userId?.name} ({new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()})
            </span>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {displayedList.map((item) => {
          const isOwner = activeTab === 'mine' || item.userId?._id === currentUser._id;
          return (
            <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-indigo-500"></div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                    {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {activeTab === 'team' && item.userId?.name && (
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md">
                      {item.userId.name} • {item.userId.role}
                    </span>
                  )}
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    {editingId === item._id ? (
                      <>
                        <button onClick={() => handleSaveEdit(item._id)} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-500 transition">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-lg hover:bg-slate-700 transition">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(item)} className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Yesterday's Accomplishments</h4>
                  {editingId === item._id ? (
                    <textarea
                      rows="3"
                      value={editForm.yesterdayWork}
                      onChange={(e) => setEditForm({ ...editForm, yesterdayWork: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">{item.yesterdayWork}</p>
                  )}
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Today's Focus</h4>
                  {editingId === item._id ? (
                    <textarea
                      rows="3"
                      value={editForm.todayPlan}
                      onChange={(e) => setEditForm({ ...editForm, todayPlan: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">{item.todayPlan}</p>
                  )}
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blockers / Concerns</h4>
                  {editingId === item._id ? (
                    <textarea
                      rows="3"
                      value={editForm.blockers}
                      onChange={(e) => setEditForm({ ...editForm, blockers: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <p className="text-sm text-slate-200 leading-relaxed">{item.blockers}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}