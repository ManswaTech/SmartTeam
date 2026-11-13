import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ role }) {
  const linkStyle = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
    }`;

  return (
    <aside className="w-full md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800/80 p-4">
      <nav className="flex flex-col gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase px-3">
            PTO Tracker
          </span>
          <div className="flex flex-col gap-1 mt-2">
            <NavLink to="/pto/apply" className={linkStyle}>
              <span>Apply for Leave</span>
            </NavLink>
            {(role === 'Manager' || role === 'Admin') && (
              <NavLink to="/pto/requests" className={linkStyle}>
                <span>Leave Approvals</span>
              </NavLink>
            )}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase px-3">
            StandUp AI
          </span>
          <div className="flex flex-col gap-1 mt-2">
            <NavLink to="/standup" className={linkStyle}>
              <span>AI Standup Reporter</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </aside>
  );
}