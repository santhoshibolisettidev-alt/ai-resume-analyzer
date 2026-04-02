
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ScoreRing from '../components/ScoreRing';

const CATEGORY_COLORS = {
  'Programming Languages': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Frontend': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  'Backend': 'bg-green-500/10 text-green-300 border-green-500/20',
  'Databases': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'DevOps & Cloud': 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'Tools & Others': 'bg-pink-500/10 text-pink-300 border-pink-500/20',
};

const Upload = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (f) => {
    setError('');
    setResult(null);
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      });
      setResult(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Result View ────────────────────────────────────────────────────────────
  if (result) {
    const { analysis, original_filename } = result;
    const allSkills = analysis?.skills_found || {};
    const suggestions = analysis?.suggestions || [];
    const softSkills = analysis?.soft_skills || [];

    return (
      <div className="min-h-screen mesh-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Banner */}
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-6 animate-fade-in">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-300 font-semibold text-sm">Resume analyzed successfully!</p>
              <p className="text-green-500 text-xs">{original_filename}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Score Card */}
            <div className="card text-center">
              <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">AI Score</h3>
              <ScoreRing score={analysis?.score || 0} size={150} />
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-slate-500">Words</p>
                  <p className="text-white font-semibold">{analysis?.word_count || 0}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-slate-500">Skills</p>
                  <p className="text-white font-semibold">{Object.values(allSkills).flat().length}</p>
                </div>
              </div>
            </div>

            {/* Skills Found */}
            <div className="md:col-span-2 card">
              <h3 className="font-display text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Skills Detected</h3>
              {Object.keys(allSkills).length === 0 ? (
                <p className="text-slate-500 text-sm">No recognized skills found. Make sure your skills section is clearly written.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(allSkills).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs text-slate-500 mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${CATEGORY_COLORS[category] || 'bg-white/5 text-slate-300 border-white/10'}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {softSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-2">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((s, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg border bg-slate-500/10 text-slate-300 border-slate-500/20 font-medium capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="md:col-span-3 card border border-amber-500/20 bg-amber-500/5">
                <h3 className="font-display text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>💡</span> Improvement Suggestions
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-white/5 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-amber-400 font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={reset} className="btn-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Another
            </button>
            <button onClick={() => navigate(`/resume/${result.id}`)} className="btn-primary flex items-center gap-2">
              View Full Analysis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload View ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Upload Resume</h1>
          <p className="text-slate-400 mt-1 text-sm">Upload your PDF resume to get an AI-powered analysis</p>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer animate-slide-up
            ${dragging ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/5'}
            ${file ? 'border-green-500/40 bg-green-500/5' : ''}
          `}
          style={{ animationDelay: '0.1s' }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {file ? (
            <div className="animate-fade-in">
              <div className="w-16 h-20 mx-auto mb-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center">
                <div className="text-red-400 text-sm font-bold font-mono">PDF</div>
              </div>
              <p className="text-white font-semibold text-lg">{file.name}</p>
              <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="mt-3 text-xs text-slate-500 hover:text-red-400 transition-colors underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">Drop your resume here</p>
              <p className="text-slate-400 text-sm mt-1">or <span className="text-blue-400">click to browse</span></p>
              <p className="text-slate-600 text-xs mt-3">PDF only · Max 5MB</p>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-5 card animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300 font-medium">Analyzing resume...</span>
              <span className="text-sm text-blue-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Extracting text and detecting skills…</p>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploading && (
          <button
            onClick={handleUpload}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2 text-base py-4 animate-slide-up"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Analyze Resume with AI
          </button>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: '🔍', title: 'Skill Detection', desc: 'Identifies 50+ technical skills across categories' },
            { icon: '📊', title: 'Score Analysis', desc: 'AI-powered scoring with actionable feedback' },
            { icon: '💡', title: 'Suggestions', desc: 'Personalized tips to improve your resume' },
          ].map((item, i) => (
            <div key={i} className="card text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Upload;