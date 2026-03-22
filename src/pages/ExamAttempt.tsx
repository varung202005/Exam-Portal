import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, addResult, generateId, hasStudentAttempted } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Send, Clock, Flag, AlertTriangle } from 'lucide-react';

const ExamAttempt = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const exam = getExam(examId || '');

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (exam) {
      setTimeLeft(exam.duration * 60);
      setTimerStarted(true);
    }
  }, [exam]);

  const handleSubmit = useCallback(() => {
    if (submittedRef.current || !exam || !user) return;
    submittedRef.current = true;
    setSubmitted(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const totalMarks = exam.questions.reduce((a, q) => a + q.marks, 0);

    exam.questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans) { skipped++; return; }
      if (ans === q.correctAnswer) { correct++; score += q.marks; } else { wrong++; }
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const resultId = generateId();
    addResult({
      id: resultId, examId: exam.id, examTitle: exam.title, subject: exam.subject,
      studentId: user.id, studentName: user.name, answers, score, totalMarks,
      totalQuestions: exam.questions.length, correctAnswers: correct, wrongAnswers: wrong,
      skipped, percentage, passed: percentage >= exam.passingPercentage,
      timeTaken: (exam.duration * 60) - timeLeft, submittedAt: new Date().toISOString(),
    });
    navigate(`/result/${resultId}`);
  }, [submitted, exam, user, answers, timeLeft, navigate]);

  useEffect(() => {
    if (!timerStarted || submitted) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (!submittedRef.current) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStarted, submitted]);

  if (!exam) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><p className="text-sm text-muted-foreground mb-4">Exam not found.</p>
        <Button variant="outline" onClick={() => navigate('/student')} className="rounded-xl">Back to Dashboard</Button>
      </div>
    </div>
  );

  if (user && hasStudentAttempted(user.id, exam.id)) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><p className="text-sm text-muted-foreground mb-4">You've already attempted this exam.</p>
        <Button variant="outline" onClick={() => navigate('/student')} className="rounded-xl">Back to Dashboard</Button>
      </div>
    </div>
  );

  const current = exam.questions[currentIndex];
  const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / exam.questions.length) * 100;
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const isLowTime = timeLeft < 60;

  const toggleFlag = (qId: string) => {
    setFlagged(prev => { const n = new Set(prev); if (n.has(qId)) n.delete(qId); else n.add(qId); return n; });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground hidden sm:block">{exam.title}</h1>
          <span className="text-xs text-muted-foreground">Q{currentIndex + 1}/{exam.questions.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className={`h-4 w-4 ${isLowTime ? 'text-destructive animate-pulse-slow' : 'text-muted-foreground'}`} />
            <span className={`font-mono text-sm font-bold tabular-nums ${isLowTime ? 'text-destructive' : 'text-foreground'}`}>{formatTime(timeLeft)}</span>
          </div>
          <Button size="sm" onClick={() => setShowConfirm(true)} className="rounded-xl text-xs">
            <Send className="mr-1 h-3 w-3" /> Submit
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 lg:px-6 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-1.5 flex-1" />
          <span className="text-[11px] text-muted-foreground tabular-nums">{answeredCount}/{exam.questions.length}</span>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Question nav sidebar */}
        <div className="hidden lg:block w-56 border-r border-border bg-card p-4 overflow-y-auto">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {exam.questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentIndex(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all relative ${
                  i === currentIndex ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                  : answers[q.id] ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-secondary text-muted-foreground hover:bg-muted'
                }`}
              >
                {i + 1}
                {flagged.has(q.id) && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500/15 border border-emerald-500/30" /> Answered ({answeredCount})</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary" /> Unanswered ({exam.questions.length - answeredCount})</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" /> Flagged ({flagged.size})</div>
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 lg:p-8 max-w-3xl mx-auto w-full animate-fade-in" key={currentIndex}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Question {currentIndex + 1}</span>
                {current.topic && <span className="text-[10px] text-muted-foreground ml-2">· {current.topic}</span>}
                {current.marks > 1 && <span className="text-[10px] text-muted-foreground ml-2">· {current.marks} marks</span>}
              </div>
              <Button variant={flagged.has(current.id) ? 'default' : 'ghost'} size="sm"
                onClick={() => toggleFlag(current.id)}
                className={`rounded-lg text-xs ${flagged.has(current.id) ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
              >
                <Flag className="mr-1 h-3 w-3" /> {flagged.has(current.id) ? 'Flagged' : 'Flag'}
              </Button>
            </div>

            <h2 className="text-base lg:text-lg font-semibold text-foreground mb-6 leading-relaxed">{current.question}</h2>

            <div className="space-y-3">
              {options.map(opt => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [current.id]: opt })}
                  className={`exam-option ${answers[current.id] === opt ? 'exam-option-selected' : 'exam-option-default'}`}
                >
                  <span className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold shrink-0 transition-all ${
                    answers[current.id] === opt ? 'bg-primary border-primary text-primary-foreground' : 'border-border text-muted-foreground'
                  }`}>{opt}</span>
                  <span className="text-sm text-foreground font-medium text-left">{current.options[opt]}</span>
                </button>
              ))}
            </div>

            {answers[current.id] && (
              <Button variant="ghost" size="sm" className="mt-3 text-xs text-muted-foreground"
                onClick={() => { const next = { ...answers }; delete next[current.id]; setAnswers(next); }}>
                Clear selection
              </Button>
            )}
          </div>

          {/* Mobile question nav */}
          <div className="lg:hidden border-t border-border bg-card px-4 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {exam.questions.map((q, i) => (
                <button key={q.id} onClick={() => setCurrentIndex(i)}
                  className={`w-7 h-7 rounded-md text-[10px] font-medium shrink-0 transition-all relative ${
                    i === currentIndex ? 'bg-primary text-primary-foreground' : answers[q.id] ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-secondary text-muted-foreground'
                  }`}
                >{i + 1}{flagged.has(q.id) && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />}</button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-border bg-card px-4 lg:px-8 py-3">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="rounded-xl">
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              {currentIndex === exam.questions.length - 1 ? (
                <Button onClick={() => setShowConfirm(true)} className="rounded-xl">
                  <Send className="mr-1 h-4 w-4" /> Submit Exam
                </Button>
              ) : (
                <Button onClick={() => setCurrentIndex(Math.min(exam.questions.length - 1, currentIndex + 1))} className="rounded-xl">
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Submit Exam?</DialogTitle>
            <DialogDescription>
              You've answered {answeredCount} of {exam.questions.length} questions.
              {exam.questions.length - answeredCount > 0 && ` ${exam.questions.length - answeredCount} questions are unanswered.`}
              {flagged.size > 0 && ` ${flagged.size} flagged for review.`}
              {' '}This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-xl">Continue Exam</Button>
            <Button onClick={handleSubmit} className="rounded-xl">Submit Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamAttempt;
