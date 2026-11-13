import React from 'react';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
          ST
        </div>
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          SmartTeam Engine
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
          <p className="text-xs text-indigo-400 font-medium capitalize">{user?.role || 'Employee'}</p>
        </div>
        <button 
          onClick={onLogout} 
          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}