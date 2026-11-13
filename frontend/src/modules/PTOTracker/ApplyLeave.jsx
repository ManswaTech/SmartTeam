import React, { useState } from 'react';
import API from '../../services/api';

export default function ApplyLeave() {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await API.post('/leaves/apply', form);
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' });
      setForm({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
      <p className="text-xs text-slate-400 mt-1 mb-6">Submit a new PTO request for manager approval.</p>

      {message.text && (
        <div className={`p-3.5 rounded-xl text-sm font-medium mb-5 border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
            <input 
              type="date" required 
              value={form.startDate} 
              onChange={(e) => setForm({...form, startDate: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date</label>
            <input 
              type="date" required 
              value={form.endDate} 
              onChange={(e) => setForm({...form, endDate: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason for Absence</label>
          <textarea 
            required rows="3"
            value={form.reason} 
            onChange={(e) => setForm({...form, reason: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Family trip, doctor appointment, personal leave, etc."
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/25 disabled:opacity-50 text-sm mt-2"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}