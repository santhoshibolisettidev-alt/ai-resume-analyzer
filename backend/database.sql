-- ============================================
-- AI Resume Analyzer - Database Setup Script
-- Run this in MySQL Workbench or MySQL CLI
-- ============================================

-- Create the database
CREATE DATABASE IF NOT EXISTS ai_resume_analyzer;
USE ai_resume_analyzer;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- RESUMES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  extracted_text LONGTEXT,
  skills_found JSON,
  word_count INT DEFAULT 0,
  analysis_score INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Sample data (optional - for testing)
-- ============================================
-- INSERT INTO users (full_name, email, password) VALUES 
-- ('Test User', 'test@example.com', '$2a$10$hashedpassword');

-- ============================================
-- Verify tables created
-- ============================================
SHOW TABLES;
DESCRIBE users;
DESCRIBE resumes;

select * from users;
