
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORY_COLORS = {
  'Programming Languages': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Frontend': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Backend': 'bg-green-500/10 text-green-300 border-green-500/20',
  'Databases': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'DevOps & Cloud': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'Tools & Others': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
};

const History = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.resumes || []);
    } catch {
      setError('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    setDeleting(id);
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch {
      alert('Failed to delete.');
    } finally {
      setDeleting(null);
    }
  };

  const getSkillsArray = (skills) => {
    if (!skills) return [];
    try {
      const parsed = typeof skills === 'string' ? JSON.parse(skills) : skills;
      return Object.entries(parsed);
    } catch { return []; }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-400';
    if (s >= 60) return 'text-blue-400';
    if (s >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (s) => {
    if (s >= 80) return 'from-green-500/20 to-green-500/5 border-green-500/20';
    if (s >= 60) return 'from-blue-500/20 to-blue-500/5 border-blue-500/20';
    if (s >= 40) return 'from-amber-500/20 to-amber-500/5 border-amber-500/20';
    return 'from-red-500/20 to-red-500/5 border-red-500/20';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const filtered = resumes
    .filter(r => r.original_filename.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'score') return (b.analysis_score || 0) - (a.analysis_score || 0);
      if (sortBy === 'name') return a.original_filename.localeCompare(b.original_filename);
      return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    });

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Resume History</h1>
            <p className="text-slate-400 mt-1 text-sm">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center gap-2 w-fit">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Upload New
          </Link>
        </div>

        {/* Search & Sort Bar */}
        {resumes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search resumes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field sm:w-44 bg-white/5 cursor-pointer"
            >
              <option value="date" className="bg-slate-900">Sort by Date</option>
              <option value="score" className="bg-slate-900">Sort by Score</option>
              <option value="name" className="bg-slate-900">Sort by Name</option>
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="card text-center py-12 text-red-400">{error}</div>
        ) : resumes.length === 0 ? (
          <div className="card text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No resumes yet</h3>
            <p className="text-slate-400 text-sm mb-6">Upload your first resume to get started with AI analysis</p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
              Upload Your First Resume
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16 animate-fade-in">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400">No resumes match "<span className="text-white">{search}</span>"</p>
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-blue-400 hover:text-blue-300">Clear search</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((resume, idx) => {
              const skillEntries = getSkillsArray(resume.skills_found);
              const allSkillsFlat = skillEntries.flatMap(([, v]) => v);

              return (
                <div
                  key={resume.id}
                  className="card glass-hover animate-slide-up"
                  style={{ animationDelay: `${0.05 * idx}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Score Badge */}
                    <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br border flex flex-col items-center justify-center ${getScoreBg(resume.analysis_score)}`}>
                      <span className={`font-display text-xl font-bold ${getScoreColor(resume.analysis_score)}`}>{resume.analysis_score}</span>
                      <span className="text-xs text-slate-500">score</span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-white font-semibold truncate max-w-xs">{resume.original_filename}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{formatDate(resume.uploaded_at)}</span>
                            <span className="text-xs text-slate-700">·</span>
                            <span className="text-xs text-slate-500">{formatSize(resume.file_size)}</span>
                            <span className="text-xs text-slate-700">·</span>
                            <span className="text-xs text-slate-500">{resume.word_count} words</span>
                            <span className="text-xs text-slate-700">·</span>
                            <span className="text-xs text-slate-500">{allSkillsFlat.length} skills found</span>
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to={`/resume/${resume.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            disabled={deleting === resume.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all disabled:opacity-50"
                          >
                            {deleting === resume.id ? (
                              <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Skills preview grouped by category */}
                      {skillEntries.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {skillEntries.slice(0, 3).flatMap(([cat, skills]) =>
                            skills.slice(0, 2).map((skill, i) => (
                              <span
                                key={`${cat}-${i}`}
                                className={`text-xs px-2.5 py-0.5 rounded-lg border ${CATEGORY_COLORS[cat] || 'bg-white/5 text-slate-400 border-white/10'}`}
                              >
                                {skill}
                              </span>
                            ))
                          )}
                          {allSkillsFlat.length > 6 && (
                            <span className="text-xs px-2 py-0.5 text-slate-500">+{allSkillsFlat.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;