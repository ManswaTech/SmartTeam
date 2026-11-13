import React, { useEffect, useState } from 'react';
import API from '../../services/api';

export default function LeaveRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/leaves/team-requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`/leaves/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-1">Team Leave Requests</h2>
      <p className="text-xs text-slate-400 mb-6">Review and manage pending employee PTO applications.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                  No leave requests submitted yet.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {req.userId?.name || 'Unknown'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs">
                    {new Date(req.startDate).toLocaleDateString()} &rarr; {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{req.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      req.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      req.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Approved')} 
                          className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Rejected')} 
                          className="bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white px-3 py-1 rounded-lg text-xs font-semibold transition"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}