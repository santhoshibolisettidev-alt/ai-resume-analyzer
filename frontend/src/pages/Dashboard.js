
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ScoreRing from '../components/ScoreRing';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card glass-hover">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">{label}</p>
        <p className={`text-3xl font-display font-bold ${color || 'text-white'}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">{icon}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.resumes || []);
    } catch (err) {
      setError('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete resume.');
    }
  };

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((a, r) => a + (r.analysis_score || 0), 0) / resumes.length)
    : 0;

  const latestResume = resumes[0];

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const getSkillsArray = (skills) => {
    if (!skills) return [];
    const parsed = typeof skills === 'string' ? JSON.parse(skills) : skills;
    return Object.values(parsed).flat();
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-blue-400';
    if (s >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-green-500/10 border-green-500/20';
    if (s >= 60) return 'bg-blue-500/10 border-blue-500/20';
    if (s >= 40) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="gradient-text">{user?.full_name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's an overview of your resume analytics</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard icon="📄" label="Total Resumes" value={resumes.length} sub="uploaded" />
          <StatCard icon="⭐" label="Avg. Score" value={`${avgScore}`} sub="out of 100" color={getScoreColor(avgScore)} />
          <StatCard icon="🔥" label="Best Score" value={resumes.length ? Math.max(...resumes.map(r => r.analysis_score || 0)) : 0} sub="all time" color="text-amber-400" />
          <StatCard icon="🛠" label="Skills Found" value={latestResume ? getSkillsArray(latestResume.skills_found).length : 0} sub="in latest resume" color="text-violet-400" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Resumes */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Recent Resumes</h2>
              <Link to="/upload" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Upload New
              </Link>
            </div>

            {loading ? (
              <div className="card flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="card text-center py-12 text-red-400">{error}</div>
            ) : resumes.length === 0 ? (
              <div className="card text-center py-16">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">No resumes yet</h3>
                <p className="text-slate-400 text-sm mb-5">Upload your first resume to get AI-powered analysis</p>
                <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.slice(0, 5).map((resume, idx) => {
                  const skills = getSkillsArray(resume.skills_found);
                  return (
                    <div key={resume.id} className="card glass-hover animate-slide-up" style={{ animationDelay: `${0.1 * idx}s` }}>
                      <div className="flex items-center gap-4">
                        {/* PDF icon */}
                        <div className="w-10 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col items-center justify-center shrink-0">
                          <div className="text-red-400 text-xs font-bold font-mono">PDF</div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{resume.original_filename}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500">{formatDate(resume.uploaded_at)}</span>
                            <span className="text-xs text-slate-600">·</span>
                            <span className="text-xs text-slate-500">{formatSize(resume.file_size)}</span>
                            <span className="text-xs text-slate-600">·</span>
                            <span className="text-xs text-slate-500">{resume.word_count} words</span>
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {skills.slice(0, 4).map((s, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">{s}</span>
                              ))}
                              {skills.length > 4 && (
                                <span className="text-xs px-2 py-0.5 text-slate-500">+{skills.length - 4} more</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Score */}
                        <div className={`shrink-0 px-3 py-1.5 rounded-xl border text-sm font-bold font-display ${getScoreBg(resume.analysis_score)} ${getScoreColor(resume.analysis_score)}`}>
                          {resume.analysis_score}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            to={`/resume/${resume.id}`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {resumes.length > 5 && (
                  <Link to="/history" className="block text-center text-sm text-blue-400 hover:text-blue-300 py-2 transition-colors">
                    View all {resumes.length} resumes →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>

            {/* Latest Score */}
            {latestResume && (
              <div className="card text-center">
                <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Latest Score</h3>
                <ScoreRing score={latestResume.analysis_score || 0} size={140} />
                <p className="text-xs text-slate-500 mt-3 truncate px-2">{latestResume.original_filename}</p>
                <Link to={`/resume/${latestResume.id}`} className="mt-4 btn-secondary text-sm py-2 w-full block text-center">
                  View Analysis
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card">
              <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/upload', icon: '⬆️', label: 'Upload New Resume', desc: 'PDF up to 5MB' },
                  { to: '/history', icon: '📋', label: 'View All Resumes', desc: `${resumes.length} uploaded` },
                ].map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{action.label}</p>
                      <p className="text-xs text-slate-500">{action.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div className="card border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-blue-300 mb-1">Pro Tip</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Include quantifiable achievements like "Increased sales by 30%" to boost your resume score significantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;