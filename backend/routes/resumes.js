
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// ─── Multer Storage Config ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}.pdf`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ─── Skills & Keywords Dictionary ────────────────────────────────────────────
const SKILLS_DICT = {
  'Programming Languages': ['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r'],
  'Frontend': ['react', 'react.js', 'angular', 'vue', 'vue.js', 'html', 'css', 'html5', 'css3', 'sass', 'tailwind', 'bootstrap', 'jquery', 'redux', 'next.js', 'gatsby'],
  'Backend': ['node.js', 'express', 'express.js', 'django', 'flask', 'spring', 'laravel', 'fastapi', 'graphql', 'rest api', 'microservices'],
  'Databases': ['mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'oracle', 'sql server', 'firebase', 'dynamodb', 'elasticsearch'],
  'DevOps & Cloud': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'github actions', 'terraform', 'ansible', 'linux', 'nginx'],
  'Tools & Others': ['git', 'github', 'jira', 'figma', 'postman', 'webpack', 'babel', 'npm', 'yarn', 'agile', 'scrum', 'rest', 'graphql']
};

const SOFT_SKILLS = ['leadership', 'communication', 'teamwork', 'problem solving', 'time management', 'analytical', 'creative', 'adaptable', 'collaboration', 'mentoring'];

// ─── Analyzer Function ────────────────────────────────────────────────────────
function analyzeResume(text) {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/).length;

  // Find skills
  const foundSkills = {};
  let totalSkillsFound = 0;

  for (const [category, skills] of Object.entries(SKILLS_DICT)) {
    const matches = skills.filter(skill => lowerText.includes(skill.toLowerCase()));
    if (matches.length > 0) {
      foundSkills[category] = matches.map(s => {
        // Capitalize nicely
        return s.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('.');
      });
      totalSkillsFound += matches.length;
    }
  }

  // Soft skills
  const softSkillsFound = SOFT_SKILLS.filter(s => lowerText.includes(s));

  // Score calculation (0-100)
  let score = 0;
  score += Math.min(totalSkillsFound * 5, 40);  // up to 40 pts for tech skills
  score += Math.min(softSkillsFound.length * 3, 15); // up to 15 pts for soft skills
  score += words > 300 ? 15 : Math.floor(words / 20); // content length
  score += lowerText.includes('experience') ? 10 : 0;
  score += lowerText.includes('education') ? 10 : 0;
  score += (lowerText.includes('project') || lowerText.includes('projects')) ? 10 : 0;
  score = Math.min(score, 100);

  // Suggestions
  const suggestions = [];
  if (!lowerText.includes('experience')) suggestions.push('Add a Work Experience section');
  if (!lowerText.includes('education')) suggestions.push('Add an Education section');
  if (!lowerText.includes('project')) suggestions.push('Showcase your Projects');
  if (words < 200) suggestions.push('Resume seems short — add more detail');
  if (totalSkillsFound < 5) suggestions.push('List more technical skills');
  if (softSkillsFound.length === 0) suggestions.push('Include soft skills like leadership, communication');

  return {
    skills_found: foundSkills,
    soft_skills: softSkillsFound,
    word_count: words,
    analysis_score: score,
    suggestions,
    total_skills_count: totalSkillsFound
  };
}

// ─── POST /api/resumes/upload ─────────────────────────────────────────────────
router.post('/upload', authMiddleware, (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    try {
      // Parse PDF
      const dataBuffer = fs.readFileSync(req.file.path);
      let extractedText = '';
      
      try {
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text || '';
      } catch (parseErr) {
        console.warn('PDF parse warning:', parseErr.message);
        extractedText = '';
      }

      // Analyze
      const analysis = analyzeResume(extractedText);

      // Store in DB
      const [result] = await db.execute(
        `INSERT INTO resumes 
         (user_id, original_filename, stored_filename, file_size, extracted_text, skills_found, word_count, analysis_score) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          req.file.originalname,
          req.file.filename,
          req.file.size,
          extractedText.substring(0, 65000),
          JSON.stringify(analysis.skills_found),
          analysis.word_count,
          analysis.analysis_score
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully!',
        resume: {
          id: result.insertId,
          original_filename: req.file.originalname,
          file_size: req.file.size,
          analysis: {
            ...analysis,
            score: analysis.analysis_score
          }
        }
      });

    } catch (dbErr) {
      console.error('Upload error:', dbErr);
      // Clean up file if DB insert failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ success: false, message: 'Failed to process resume. Please try again.' });
    }
  });
});

// ─── GET /api/resumes ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [resumes] = await db.execute(
      `SELECT id, original_filename, file_size, skills_found, word_count, analysis_score, uploaded_at 
       FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, resumes });
  } catch (err) {
    console.error('Fetch resumes error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch resumes.' });
  }
});

// ─── GET /api/resumes/:id ─────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [resumes] = await db.execute(
      `SELECT id, original_filename, file_size, extracted_text, skills_found, word_count, analysis_score, uploaded_at 
       FROM resumes WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (resumes.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const resume = resumes[0];
    // Re-run analysis for suggestions
    const analysis = analyzeResume(resume.extracted_text || '');

    res.json({
      success: true,
      resume: {
        ...resume,
        analysis: {
          skills_found: typeof resume.skills_found === 'string' ? JSON.parse(resume.skills_found) : resume.skills_found,
          suggestions: analysis.suggestions,
          soft_skills: analysis.soft_skills,
          score: resume.analysis_score,
          word_count: resume.word_count
        }
      }
    });
  } catch (err) {
    console.error('Fetch resume error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch resume details.' });
  }
});

// ─── DELETE /api/resumes/:id ──────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [resumes] = await db.execute(
      'SELECT stored_filename FROM resumes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (resumes.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Delete file
    const filePath = path.join(__dirname, '../uploads', resumes[0].stored_filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.execute('DELETE FROM resumes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (err) {
    console.error('Delete resume error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete resume.' });
  }
});

module.exports = router;