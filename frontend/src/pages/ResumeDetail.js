import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ScoreRing from '../components/ScoreRing';

const CATEGORY_COLORS = {
  'Programming Languages': { pill: 'bg-violet-500/10 text-violet-300 border-violet-500/20', header: 'text-violet-400', bar: 'bg-violet-500' },
  'Frontend': { pill: 'bg-blue-500/10 text-blue-300 border-blue-500/20', header: 'text-blue-400', bar: 'bg-blue-500' },
  'Backend': { pill: 'bg-green-500/10 text-green-300 border-green-500/20', header: 'text-green-400', bar: 'bg-green-500' },
  'Databases': { pill: 'bg-amber-500/10 text-amber-300 border-amber-500/20', header: 'text-amber-400', bar: 'bg-amber-500' },
  'DevOps & Cloud': { pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', header: 'text-cyan-400', bar: 'bg-cyan-500' },
  'Tools & Others': { pill: 'bg-pink-500/10 text-pink-300 border-pink-500/20', header: 'text-pink-400', bar: 'bg-pink-500' },
};

const DEFAULT_COLOR = { pill: 'bg-white/5 text-slate-300 border-white/10', header: 'text-slate-400', bar: 'bg-slate-500' };

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const res = await api.get(`/resumes/${id}`);
      setResume(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      navigate('/history');
    } catch {
      alert('Failed to delete.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formatSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/history" className="btn-primary">Back to History</Link>
      </div>
    </div>
  );

  const { analysis, original_filename, file_size, uploaded_at, word_count } = resume;
  const skillsFound = analysis?.skills_found || {};
  const suggestions = analysis?.suggestions || [];
  const softSkills = analysis?.soft_skills || [];
  const score = analysis?.score || 0;
  const allSkillsFlat = Object.values(skillsFound).flat();

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills', label: `Skills (${allSkillsFlat.length})` },
    { key: 'suggestions', label: `Tips (${suggestions.length})` },
  ];

  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Excellent Resume', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    if (s >= 60) return { label: 'Good Resume', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (s >= 40) return { label: 'Average Resume', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { label: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
  };

  const scoreInfo = getScoreLabel(score);

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 animate-fade-in">
          <Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/history" className="hover:text-slate-300 transition-colors">History</Link>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{original_filename}</span>
        </div>

        {/* Header */}
        <div className="card mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* PDF Icon */}
            <div className="w-16 h-20 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center shrink-0">
              <span className="text-red-400 text-sm font-bold font-mono">PDF</span>
            </div>

            {/* File Info */}
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold text-white mb-1">{original_filename}</h1>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(uploaded_at)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {formatSize(file_size)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" /></svg>
                  {word_count} words
                </span>
              </div>
              <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full border text-xs font-medium ${scoreInfo.bg} ${scoreInfo.color}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                {scoreInfo.label}
              </div>
            </div>

            {/* Score */}
            <div className="shrink-0">
              <ScoreRing score={score} size={110} />
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <Link to="/upload" className="btn-primary text-sm py-2 px-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 glass rounded-xl mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'AI Score', value: score, suffix: '/100', color: score >= 60 ? 'text-blue-400' : 'text-amber-400' },
                { label: 'Skills Detected', value: allSkillsFlat.length, suffix: ' skills', color: 'text-violet-400' },
                { label: 'Word Count', value: word_count, suffix: ' words', color: 'text-cyan-400' },
                { label: 'Skill Categories', value: Object.keys(skillsFound).length, suffix: ' categories', color: 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="card text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.suffix}</p>
                </div>
              ))}

              {/* Skill Distribution */}
              {Object.keys(skillsFound).length > 0 && (
                <div className="sm:col-span-2 lg:col-span-4 card">
                  <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Skill Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(skillsFound).map(([cat, skills]) => {
                      const colors = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
                      const pct = Math.round((skills.length / Math.max(allSkillsFlat.length, 1)) * 100);
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className={`font-medium ${colors.header}`}>{cat}</span>
                            <span className="text-slate-500">{skills.length} skill{skills.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div
                              className={`${colors.bar} h-1.5 rounded-full transition-all duration-1000`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {softSkills.length > 0 && (
                <div className="sm:col-span-2 lg:col-span-4 card">
                  <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Soft Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-xl capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div>
              {Object.keys(skillsFound).length === 0 ? (
                <div className="card text-center py-16">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-slate-400">No skills were detected in this resume.</p>
                  <p className="text-slate-500 text-sm mt-2">Make sure your resume clearly lists your technical skills.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(skillsFound).map(([category, skills]) => {
                    const colors = CATEGORY_COLORS[category] || DEFAULT_COLOR;
                    return (
                      <div key={category} className="card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-display text-sm font-semibold ${colors.header}`}>{category}</h3>
                          <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">{skills.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1.5 text-sm rounded-xl border font-medium ${colors.pill}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUGGESTIONS TAB */}
          {activeTab === 'suggestions' && (
            <div>
              {suggestions.length === 0 ? (
                <div className="card text-center py-16">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">Excellent Resume!</h3>
                  <p className="text-slate-400 text-sm">Your resume covers all the key sections. Keep it up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="card border border-amber-500/20 bg-amber-500/5 mb-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h3 className="font-display font-semibold text-amber-300 mb-1">AI-Powered Suggestions</h3>
                        <p className="text-slate-400 text-sm">Based on resume best practices, here are personalized recommendations to improve your resume score.</p>
                      </div>
                    </div>
                  </div>
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="card glass-hover flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0 text-sm font-bold text-blue-400 font-display">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm leading-relaxed">{suggestion}</p>
                      </div>
                      <div className="shrink-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400/60 mt-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;