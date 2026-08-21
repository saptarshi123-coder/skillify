import pythonBank from '../data/aiQuestionBanks/python.json';
import webdevBank from '../data/aiQuestionBanks/webdev.json';
import appdevBank from '../data/aiQuestionBanks/appdev.json';

const API_BASE = '/api/quiz';

const LOCAL_BANKS = {
  python: pythonBank,
  'web dev': webdevBank,
  'webdev': webdevBank,
  'web-dev': webdevBank,
  'app dev': appdevBank,
  'appdev': appdevBank,
  'app-dev': appdevBank
};

export const AI_SUPPORTED_SKILLS = [
  'python',
  'web dev',
  'webdev',
  'web-dev',
  'app dev',
  'appdev',
  'app-dev',
  'flutter',
  'kotlin',
  'next.js',
  'node.js',
  'html',
  'css'
];

export function isAISupportedSkill(skillIdOrName) {
  if (!skillIdOrName) return false;
  const s = String(skillIdOrName).toLowerCase().trim();
  return (
    AI_SUPPORTED_SKILLS.includes(s) ||
    s.includes('python') ||
    s.includes('web') ||
    s.includes('app') ||
    s.includes('flutter') ||
    s.includes('kotlin') ||
    s.includes('next') ||
    s.includes('node') ||
    s.includes('html') ||
    s.includes('css')
  );
}

export function normalizeSkillKey(skillIdOrName) {
  const s = String(skillIdOrName).toLowerCase().trim();
  if (s.includes('python') || s === 'py') return 'python';
  if (s.includes('web') || s.includes('html') || s.includes('css') || s.includes('next') || s.includes('node') || s.includes('react')) return 'web dev';
  if (s.includes('app') || s.includes('flutter') || s.includes('kotlin') || s.includes('mobile') || s.includes('android')) return 'app dev';
  return 'python';
}

// NLP & String Matching Utilities (Matching nlp_checker.py 1:1)
function normalizeText(text) {
  return String(text || '').trim().toLowerCase().replace(/_/g, ' ');
}

function levenshteinRatio(s1, s2) {
  const n1 = normalizeText(s1);
  const n2 = normalizeText(s2);
  if (n1 === n2) return 1.0;
  if (!n1 || !n2) return 0.0;

  const len1 = n1.length;
  const len2 = n2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = n1[i - 1] === n2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1.0 - distance / Math.max(len1, len2);
}

function checkMCQ(userAnswer, correctAnswer, options = []) {
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);

  if (userNorm === correctNorm) return true;

  if (options && options.length > 0) {
    const letterMap = {};
    options.forEach((opt, idx) => {
      const letter = String.fromCharCode(97 + idx); // 'a', 'b', 'c', 'd'
      letterMap[letter] = normalizeText(opt);
    });

    if (letterMap[userNorm] && letterMap[userNorm] === correctNorm) {
      return true;
    }

    for (const [letter, optNorm] of Object.entries(letterMap)) {
      if (
        userNorm.startsWith(`${letter}.`) ||
        userNorm.startsWith(`${letter})`) ||
        userNorm.startsWith(`${letter} `)
      ) {
        const remainder = userNorm.slice(letter.length).replace(/^[.)\s]+/, '').trim();
        if (remainder === optNorm || remainder === correctNorm) {
          return true;
        }
      }
      if (userNorm === optNorm && optNorm === correctNorm) {
        return true;
      }
    }
  }

  return levenshteinRatio(userNorm, correctNorm) >= 0.85;
}

function checkOutput(userAnswer, correctAnswer) {
  const userNorm = normalizeText(userAnswer).replace(/\s+/g, '');
  const correctNorm = normalizeText(correctAnswer).replace(/\s+/g, '');
  return userNorm === correctNorm || levenshteinRatio(userNorm, correctNorm) >= 0.90;
}

function checkOneWord(userAnswer, correctAnswer) {
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);

  if (userNorm === correctNorm) return true;
  if (correctNorm.length > 2 && (correctNorm.includes(userNorm) || userNorm.includes(correctNorm))) {
    return true;
  }
  return levenshteinRatio(userNorm, correctNorm) >= 0.80;
}

function checkShortAnswer(userAnswer, correctAnswer) {
  const userNorm = normalizeText(userAnswer);
  const correctNorm = normalizeText(correctAnswer);

  if (userNorm === correctNorm) return true;
  if (correctNorm.length > 3 && (correctNorm.includes(userNorm) || userNorm.includes(correctNorm))) {
    return true;
  }

  const stopwords = new Set(["the", "a", "an", "is", "in", "it", "to", "for", "of", "and", "by", "on", "with", "that", "this"]);
  const userWords = new Set(userNorm.split(/\W+/).filter(w => w.length > 1 && !stopwords.has(w)));
  const correctWords = new Set(correctNorm.split(/\W+/).filter(w => w.length > 1 && !stopwords.has(w)));

  let matched = 0;
  correctWords.forEach(w => { if (userWords.has(w)) matched++; });
  const coverage = correctWords.size > 0 ? matched / correctWords.size : 0;
  const ratio = levenshteinRatio(userNorm, correctNorm);

  return (0.4 * ratio + 0.6 * coverage) >= 0.60;
}

function gradeSingleAnswer(userAnswer, question) {
  if (!userAnswer || !String(userAnswer).trim()) {
    return {
      correct: false,
      user_answer: '(skipped)',
      correct_answer: question.a || question.correct_answer || '',
      points: 0,
      explanation: question.explanation || `The correct answer is: ${question.a || question.correct_answer}`
    };
  }

  const qType = question.type || 'mcq';
  const correctAnswer = question.a || question.correct_answer || '';
  const options = question.options || [];
  let isCorrect = false;

  if (qType === 'mcq') {
    isCorrect = checkMCQ(userAnswer, correctAnswer, options);
  } else if (qType === 'output') {
    isCorrect = checkOutput(userAnswer, correctAnswer);
  } else if (qType === 'oneword') {
    isCorrect = checkOneWord(userAnswer, correctAnswer);
  } else if (qType === 'short') {
    isCorrect = checkShortAnswer(userAnswer, correctAnswer);
  } else {
    isCorrect = checkMCQ(userAnswer, correctAnswer, options);
  }

  return {
    correct: isCorrect,
    user_answer: userAnswer,
    correct_answer: correctAnswer,
    points: isCorrect ? 1 : -1,
    explanation: question.explanation || `Correct answer: ${correctAnswer}`
  };
}

// Equal sampling across 4 question types (Matching select_quiz in quiz_engine.py)
function selectBalancedQuiz(questions, n = 10) {
  const byType = {};
  questions.forEach(q => {
    const t = q.type || 'mcq';
    if (!byType[t]) byType[t] = [];
    byType[t].push(q);
  });

  const selected = [];
  const typeNames = Object.keys(byType);
  const perType = typeNames.length > 0 ? Math.max(1, Math.floor(n / typeNames.length)) : n;

  typeNames.forEach(t => {
    const pool = byType[t];
    const count = Math.min(perType, pool.length);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    selected.push(...shuffled.slice(0, count));
  });

  if (selected.length < n) {
    const remaining = n - selected.length;
    const used = new Set(selected);
    const pool = questions.filter(q => !used.has(q));
    const shuffledRemaining = [...pool].sort(() => 0.5 - Math.random());
    selected.push(...shuffledRemaining.slice(0, remaining));
  }

  return selected.slice(0, n).sort(() => 0.5 - Math.random());
}

export const aiQuizService = {
  // 1. Start AI Quiz
  async startQuiz(skillIdOrName) {
    const skillKey = normalizeSkillKey(skillIdOrName);

    // Try backend API first (when running on localhost / python server)
    try {
      const res = await fetch(`${API_BASE}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: skillKey })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            isAI: true,
            isOnline: true,
            sessionId: json.data.session_id,
            skill: json.data.skill,
            totalQuestions: json.data.total_questions,
            threshold: json.data.threshold || 70,
            questionTimeLimit: json.data.question_time_limit || 30,
            quizTimeLimit: json.data.quiz_time_limit || 600,
            questions: json.data.questions.map((q, idx) => ({
              id: q.question_number || idx + 1,
              question: q.question,
              type: q.type,
              typeLabel: q.type_label,
              options: q.options || [],
              optionLetters: q.option_letters || ['a', 'b', 'c', 'd'],
              rawQuestion: {
                q: q.question,
                type: q.type,
                options: q.options || [],
                a: q.a || q.correct_answer || ''
              },
              category: `${skillKey.toUpperCase()} • ${q.type_label || 'AI Question'}`
            }))
          };
        }
      }
    } catch (e) {
      // Standalone APK / Offline mode
    }

    // Identical Client-Side Engine for APK & Offline Mode
    const bank = LOCAL_BANKS[skillKey] || LOCAL_BANKS['python'];
    const chosenQuestions = selectBalancedQuiz(bank, 10);

    const typeLabels = {
      mcq: 'Multiple Choice',
      output: 'Output Prediction',
      short: 'Short Answer',
      oneword: 'One Word Answer'
    };

    const formatted = chosenQuestions.map((q, idx) => {
      const qType = q.type || 'mcq';
      return {
        id: idx + 1,
        question_number: idx + 1,
        question: q.q,
        type: qType,
        typeLabel: typeLabels[qType] || 'Core Concept',
        options: q.options || [],
        optionLetters: q.options ? q.options.map((_, i) => String.fromCharCode(97 + i)) : ['a', 'b', 'c', 'd'],
        correctAnswer: q.a,
        rawQuestion: q,
        category: `${skillKey.toUpperCase()} • ${typeLabels[qType] || 'AI Question'}`
      };
    });

    return {
      isAI: true,
      isOnline: false,
      sessionId: 'local_ai_' + Date.now(),
      skill: skillKey,
      totalQuestions: formatted.length,
      threshold: 70,
      questionTimeLimit: 30,
      quizTimeLimit: 600,
      questions: formatted
    };
  },

  // 2. Submit AI Answer
  async submitAnswer(sessionId, questionNumber, answer, questionObj) {
    if (sessionId && !sessionId.startsWith('local_ai_')) {
      try {
        const res = await fetch(`${API_BASE}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            question_number: questionNumber,
            answer: answer
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) return json.data;
        }
      } catch (e) {
        // fallback
      }
    }

    return gradeSingleAnswer(answer, questionObj?.rawQuestion || questionObj || { a: '' });
  },

  // 3. Finalize AI Results
  async getResults(sessionId, answersList, questionsList, skillKey, timeTakenSec = 60) {
    if (sessionId && !sessionId.startsWith('local_ai_')) {
      try {
        const res = await fetch(`${API_BASE}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            return {
              accuracy: Math.round(d.accuracy || 0),
              score: Math.round(d.accuracy || 0),
              correctCount: d.correct || d.correct_answers || 0,
              totalCount: d.total || questionsList.length,
              passed: (d.accuracy || 0) >= 70,
              timeTakenSec: d.time_taken || timeTakenSec,
              review: d.answers || [],
              strengths: [`${skillKey.toUpperCase()} Problem Solving`, "Syntax Mastery"],
              weakAreas: (d.accuracy < 70) ? [`${skillKey.toUpperCase()} Advanced Patterns`] : []
            };
          }
        }
      } catch (e) {
        // fallback
      }
    }

    // Local evaluation
    let correctCount = 0;
    const review = [];
    const strengths = [];
    const weakAreas = [];

    questionsList.forEach((q, idx) => {
      const userAns = answersList[q.id] !== undefined ? answersList[q.id] : '';
      const graded = gradeSingleAnswer(userAns, q.rawQuestion || q);

      if (graded.correct) {
        correctCount++;
        const cat = q.typeLabel ? `${skillKey.toUpperCase()} • ${q.typeLabel}` : skillKey.toUpperCase();
        if (!strengths.includes(cat)) strengths.push(cat);
      } else {
        const cat = q.typeLabel ? `${skillKey.toUpperCase()} • ${q.typeLabel}` : skillKey.toUpperCase();
        if (!weakAreas.includes(cat)) weakAreas.push(cat);
      }

      review.push({
        question_number: idx + 1,
        question: q.question,
        user_answer: userAns,
        correct_answer: q.correctAnswer || (q.rawQuestion && q.rawQuestion.a) || '',
        correct: graded.correct,
        explanation: graded.explanation
      });
    });

    const totalCount = questionsList.length || 1;
    const accuracy = Math.round((correctCount / totalCount) * 100);

    return {
      accuracy,
      score: accuracy,
      correctCount,
      totalCount,
      passed: accuracy >= 70,
      timeTakenSec,
      review,
      strengths: strengths.length > 0 ? strengths : [`${skillKey.toUpperCase()} Syntax & Logic`],
      weakAreas: weakAreas.length > 0 ? weakAreas : (accuracy < 70 ? [`${skillKey.toUpperCase()} Deep Dive`] : [])
    };
  }
};
