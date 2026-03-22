export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  teacherId: string;
  teacherName: string;
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'published';
  passingPercentage: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string>;
  score: number;
  totalMarks: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  submittedAt: string;
}

const KEYS = {
  users: 'ep_users',
  exams: 'ep_exams',
  results: 'ep_results',
  currentUser: 'ep_currentUser',
  seeded: 'ep_seeded',
};

export const generateId = () => Math.random().toString(36).substring(2, 11);

function getItems<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// Users
export const getUsers = () => getItems<User>(KEYS.users);
export const addUser = (user: User) => { const u = getUsers(); u.push(user); setItems(KEYS.users, u); };
export const findUserByEmail = (email: string) => getUsers().find(u => u.email === email);

// Current user
export const getCurrentUser = (): User | null => {
  try { const d = localStorage.getItem(KEYS.currentUser); return d ? JSON.parse(d) : null; } catch { return null; }
};
export const setCurrentUser = (user: User | null) => {
  if (user) localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
  else localStorage.removeItem(KEYS.currentUser);
};

// Exams
export const getExams = () => getItems<Exam>(KEYS.exams);
export const getExam = (id: string) => getExams().find(e => e.id === id);
export const getExamsByTeacher = (teacherId: string) => getExams().filter(e => e.teacherId === teacherId);
export const getPublishedExams = () => getExams().filter(e => e.status === 'published');
export const addExam = (exam: Exam) => { const e = getExams(); e.push(exam); setItems(KEYS.exams, e); };
export const updateExam = (updated: Exam) => {
  const exams = getExams().map(e => e.id === updated.id ? updated : e);
  setItems(KEYS.exams, exams);
};
export const deleteExam = (id: string) => setItems(KEYS.exams, getExams().filter(e => e.id !== id));

// Results
export const getResults = () => getItems<ExamResult>(KEYS.results);
export const getResult = (id: string) => getResults().find(r => r.id === id);
export const getResultsByStudent = (studentId: string) => getResults().filter(r => r.studentId === studentId);
export const getResultsByExam = (examId: string) => getResults().filter(r => r.examId === examId);
export const addResult = (result: ExamResult) => { const r = getResults(); r.push(result); setItems(KEYS.results, r); };
export const hasStudentAttempted = (studentId: string, examId: string) =>
  getResults().some(r => r.studentId === studentId && r.examId === examId);

// Stats
export const getTeacherStats = (teacherId: string) => {
  const exams = getExamsByTeacher(teacherId);
  const results = getResults().filter(r => exams.some(e => e.id === r.examId));
  const uniqueStudents = new Set(results.map(r => r.studentId)).size;
  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
  const passRate = results.length ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0;
  return { totalExams: exams.length, published: exams.filter(e => e.status === 'published').length, totalStudents: uniqueStudents, avgScore, passRate, totalAttempts: results.length };
};

export const getStudentStats = (studentId: string) => {
  const results = getResultsByStudent(studentId);
  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
  const bestScore = results.length ? Math.max(...results.map(r => r.percentage)) : 0;
  const passRate = results.length ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0;
  const topicStats: Record<string, { correct: number; total: number }> = {};
  results.forEach(r => {
    const exam = getExam(r.examId);
    if (!exam) return;
    exam.questions.forEach(q => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
      topicStats[q.topic].total++;
      if (r.answers[q.id] === q.correctAnswer) topicStats[q.topic].correct++;
    });
  });
  return { examsTaken: results.length, avgScore, bestScore, passRate, topicStats, results };
};

// Seed
export const seedData = () => {
  if (localStorage.getItem(KEYS.seeded)) return;

  const teacherId = 'teacher_001';
  const studentId = 'student_001';

  const users: User[] = [
    { id: teacherId, name: 'Dr. Sarah Johnson', email: 'teacher@test.com', password: 'password123', role: 'teacher', createdAt: new Date().toISOString() },
    { id: studentId, name: 'Alex Chen', email: 'student@test.com', password: 'password123', role: 'student', createdAt: new Date().toISOString() },
  ];

  const mathQuestions: Question[] = [
    { id: 'q1', question: 'What is the derivative of x²?', options: { A: '2x', B: 'x²', C: '2', D: 'x' }, correctAnswer: 'A', explanation: 'Using the power rule: d/dx(x^n) = nx^(n-1), so d/dx(x²) = 2x.', topic: 'Calculus', marks: 2 },
    { id: 'q2', question: 'What is the integral of 2x?', options: { A: 'x', B: 'x² + C', C: '2x² + C', D: '2 + C' }, correctAnswer: 'B', explanation: 'The integral of 2x is x² + C by the power rule of integration.', topic: 'Calculus', marks: 2 },
    { id: 'q3', question: 'What is the value of sin(90°)?', options: { A: '0', B: '0.5', C: '1', D: '-1' }, correctAnswer: 'C', explanation: 'sin(90°) = 1 is a fundamental trigonometric identity.', topic: 'Trigonometry', marks: 2 },
    { id: 'q4', question: 'What is log₁₀(100)?', options: { A: '1', B: '2', C: '10', D: '0.5' }, correctAnswer: 'B', explanation: 'log₁₀(100) = 2 because 10² = 100.', topic: 'Algebra', marks: 2 },
    { id: 'q5', question: 'What is the sum of interior angles of a triangle?', options: { A: '90°', B: '180°', C: '270°', D: '360°' }, correctAnswer: 'B', explanation: 'The sum of interior angles of any triangle is always 180°.', topic: 'Geometry', marks: 2 },
  ];

  const scienceQuestions: Question[] = [
    { id: 'q6', question: 'What is the chemical symbol for water?', options: { A: 'HO', B: 'H₂O', C: 'OH₂', D: 'H₃O' }, correctAnswer: 'B', explanation: 'Water consists of two hydrogen atoms and one oxygen atom: H₂O.', topic: 'Chemistry', marks: 2 },
    { id: 'q7', question: 'What is Newton\'s Second Law?', options: { A: 'F = ma', B: 'E = mc²', C: 'F = mv', D: 'P = mv' }, correctAnswer: 'A', explanation: 'Newton\'s Second Law states that Force equals mass times acceleration.', topic: 'Physics', marks: 2 },
    { id: 'q8', question: 'What is the powerhouse of the cell?', options: { A: 'Nucleus', B: 'Ribosome', C: 'Mitochondria', D: 'Golgi body' }, correctAnswer: 'C', explanation: 'Mitochondria are responsible for producing ATP, the energy currency of cells.', topic: 'Biology', marks: 2 },
    { id: 'q9', question: 'What is the speed of light?', options: { A: '3×10⁶ m/s', B: '3×10⁸ m/s', C: '3×10¹⁰ m/s', D: '3×10⁴ m/s' }, correctAnswer: 'B', explanation: 'The speed of light in vacuum is approximately 3×10⁸ meters per second.', topic: 'Physics', marks: 2 },
    { id: 'q10', question: 'What element has atomic number 1?', options: { A: 'Helium', B: 'Oxygen', C: 'Carbon', D: 'Hydrogen' }, correctAnswer: 'D', explanation: 'Hydrogen has atomic number 1 with a single proton.', topic: 'Chemistry', marks: 2 },
  ];

  const progQuestions: Question[] = [
    { id: 'q11', question: 'What does HTML stand for?', options: { A: 'Hyper Text Markup Language', B: 'High Tech Modern Language', C: 'Hyper Transfer Markup Language', D: 'Home Tool Markup Language' }, correctAnswer: 'A', explanation: 'HTML stands for Hyper Text Markup Language.', topic: 'Web Development', marks: 2 },
    { id: 'q12', question: 'Which data structure uses LIFO?', options: { A: 'Queue', B: 'Stack', C: 'Array', D: 'Tree' }, correctAnswer: 'B', explanation: 'Stack uses Last In First Out (LIFO) principle.', topic: 'Data Structures', marks: 2 },
    { id: 'q13', question: 'What is the time complexity of binary search?', options: { A: 'O(n)', B: 'O(n²)', C: 'O(log n)', D: 'O(1)' }, correctAnswer: 'C', explanation: 'Binary search halves the search space each step, giving O(log n).', topic: 'Algorithms', marks: 2 },
    { id: 'q14', question: 'What keyword declares a constant in JavaScript?', options: { A: 'var', B: 'let', C: 'const', D: 'static' }, correctAnswer: 'C', explanation: 'The const keyword declares a block-scoped constant in JavaScript.', topic: 'Web Development', marks: 2 },
    { id: 'q15', question: 'What does CSS stand for?', options: { A: 'Computer Style Sheets', B: 'Cascading Style Sheets', C: 'Creative Style System', D: 'Colorful Style Sheets' }, correctAnswer: 'B', explanation: 'CSS stands for Cascading Style Sheets.', topic: 'Web Development', marks: 2 },
  ];

  const exams: Exam[] = [
    { id: 'exam_001', title: 'Calculus & Algebra Midterm', subject: 'Mathematics', description: 'Covers derivatives, integrals, trigonometry, and basic algebra.', duration: 30, teacherId, teacherName: 'Dr. Sarah Johnson', questions: mathQuestions, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'published', passingPercentage: 40 },
    { id: 'exam_002', title: 'General Science Quiz', subject: 'Science', description: 'Physics, Chemistry, and Biology fundamentals.', duration: 25, teacherId, teacherName: 'Dr. Sarah Johnson', questions: scienceQuestions, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'published', passingPercentage: 40 },
    { id: 'exam_003', title: 'Programming Fundamentals', subject: 'Computer Science', description: 'Web development, data structures, and algorithms.', duration: 20, teacherId, teacherName: 'Dr. Sarah Johnson', questions: progQuestions, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'published', passingPercentage: 50 },
  ];

  const results: ExamResult[] = [
    { id: 'res_001', examId: 'exam_001', examTitle: 'Calculus & Algebra Midterm', subject: 'Mathematics', studentId, studentName: 'Alex Chen', answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'A', q5: 'B' }, score: 8, totalMarks: 10, totalQuestions: 5, correctAnswers: 4, wrongAnswers: 1, skipped: 0, percentage: 80, passed: true, timeTaken: 1200, submittedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 'res_002', examId: 'exam_002', examTitle: 'General Science Quiz', subject: 'Science', studentId, studentName: 'Alex Chen', answers: { q6: 'B', q7: 'A', q8: 'C', q9: 'A', q10: 'D' }, score: 8, totalMarks: 10, totalQuestions: 5, correctAnswers: 4, wrongAnswers: 1, skipped: 0, percentage: 80, passed: true, timeTaken: 900, submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  ];

  setItems(KEYS.users, users);
  setItems(KEYS.exams, exams);
  setItems(KEYS.results, results);
  localStorage.setItem(KEYS.seeded, 'true');
};
