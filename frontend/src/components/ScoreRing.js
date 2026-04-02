
import React, { useEffect, useRef } from 'react';

const ScoreRing = ({ score = 0, size = 120 }) => {
  const circleRef = useRef(null);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current) {
      const offset = circumference - (score / 100) * circumference;
      circleRef.current.style.strokeDashoffset = offset;
    }
  }, [score, circumference]);

  const getColor = (s) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#3b82f6';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Needs Work';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background ring */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Score ring */}
        <circle
          ref={circleRef}
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="Syne">{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="DM Sans">/ 100</text>
      </svg>
      <span className="text-xs font-semibold" style={{ color: getColor(score) }}>{getLabel(score)}</span>
    </div>
  );
};

export default ScoreRing;