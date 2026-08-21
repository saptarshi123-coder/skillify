# Skillify AI - Database Layer

This directory contains the database schemas, SQLite data access layer, seed data, and AI question banks used across the application.

## Directory Structure

- **`schema/`**
  - `schema.sql`: Formal SQLite table schemas for `users`, `skills`, `projects`, `certificates`, and `chat_messages`.
  - `sqlite.js`: Complete JavaScript SQLite client service with localStorage persistence, query execution, and migration utilities.
- **`question_banks/`**
  - `python.json`: Python assessment questions, code snippet tests, and evaluation keys.
  - `webdev.json`: Web Development assessment questions.
  - `appdev.json`: Mobile Application Development assessment questions.
- **`seed_data/`**
  - `studentsData.js`: Initial student profiles and leaderboard benchmarks.
  - `quizData.js`: Default subject curricula and question sets.
  - `communityProjects.js`: Community repository showcase projects.
  - `chatbotIntents.json`: AI conversational intents and NLP patterns.
  - `learning_data.json`: Chatbot dynamic learning memory.
  - `correction_log.json`: NLP correction training logs.
