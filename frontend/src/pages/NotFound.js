
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
    <div className="text-center animate-slide-up">
      <p className="font-mono text-blue-500 text-sm mb-4 tracking-widest uppercase">Error 404</p>
      <h1 className="font-display text-7xl font-bold text-white mb-4">Oops!</h1>
      <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;