import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult, getExam } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle, Clock, Award, TrendingUp, ChevronDown, ChevronUp, Lightbulb, GraduationCap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = { correct: 'hsl(142, 76%, 36%)', wrong: 'hsl(0, 84%, 60%)', skipped: 'hsl(220, 9%, 70%)' };

const ExamResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const result = getResult(resultId || '');
  const exam = result ? getExam(result.examId) : null;
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  if (!result || !exam) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Result not found.</p>
        <Button variant="outline" onClick={() => navigate('/student')} className="rounded-xl">Back to Dashboard</Button>
      </div>
    </div>
  );

  const pieData = [
    { name: 'Correct', value: result.correctAnswers, color: COLORS.correct },
    { name: 'Wrong', value: result.wrongAnswers, color: COLORS.wrong },
    { name: 'Skipped', value: result.skipped, color: COLORS.skipped },
  ];

  const topicStats: Record<string, { correct: number; total: number }> = {};
  exam.questions.forEach(q => {
    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total++;
    if (result.answers[q.id] === q.correctAnswer) topicStats[q.topic].correct++;
  });
  const topicData = Object.entries(topicStats).map(([topic, { correct, total }]) => ({
    topic, accuracy: Math.round((correct / total) * 100),
  }));

  const timeTakenMin = Math.round(result.timeTaken / 60);
  const weakTopics = topicData.filter(t => t.accuracy < 60).map(t => t.topic);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/student')} className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-sm font-semibold text-foreground">{result.examTitle}</h1>
            <p className="text-[11px] text-muted-foreground">Exam Result</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Score Hero */}
        <div className={`surface-card p-6 text-center relative overflow-hidden ${result.passed ? 'border-emerald-500/30' : 'border-destructive/30'}`}>
          <div className={`absolute inset-0 ${result.passed ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : 'bg-gradient-to-br from-destructive/5 to-transparent'}`} />
          <div className="relative">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center ${result.passed ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
              <span className={`text-3xl font-bold ${result.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>{result.percentage}%</span>
            </div>
            <Badge className={`text-sm px-3 py-1 ${result.passed ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
              {result.passed ? '🎉 Passed' : '❌ Failed'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Score: {result.score}/{result.totalMarks} marks</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="surface-card p-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{result.correctAnswers}</p><p className="text-[10px] text-muted-foreground">Correct</p></div>
          <div className="surface-card p-3 text-center"><XCircle className="h-4 w-4 text-destructive mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{result.wrongAnswers}</p><p className="text-[10px] text-muted-foreground">Wrong</p></div>
          <div className="surface-card p-3 text-center"><MinusCircle className="h-4 w-4 text-muted-foreground mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{result.skipped}</p><p className="text-[10px] text-muted-foreground">Skipped</p></div>
          <div className="surface-card p-3 text-center"><Clock className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-lg font-bold text-foreground">{timeTakenMin}</p><p className="text-[10px] text-muted-foreground">Minutes</p></div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Answer Breakdown</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Topic Performance</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topicData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="topic" width={80} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="hsl(243, 75%, 59%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        {weakTopics.length > 0 && (
          <div className="surface-card p-4 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Smart Insights
            </h3>
            <p className="text-xs text-muted-foreground">
              You scored below 60% in <strong>{weakTopics.join(', ')}</strong>. Focus on these topics to improve your overall performance.
              Practice more questions in these areas for better results next time.
            </p>
          </div>
        )}

        {/* Question Review */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" /> Question Review
          </h3>
          <div className="space-y-2">
            {exam.questions.map((q, i) => {
              const studentAns = result.answers[q.id];
              const isCorrect = studentAns === q.correctAnswer;
              const isSkipped = !studentAns;
              const expanded = expandedQ === q.id;

              return (
                <div key={q.id} className={`surface-card overflow-hidden ${isCorrect ? 'border-emerald-500/20' : isSkipped ? '' : 'border-destructive/20'}`}>
                  <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setExpandedQ(expanded ? null : q.id)}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCorrect ? 'bg-emerald-500/10' : isSkipped ? 'bg-muted' : 'bg-destructive/10'}`}>
                      {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : isSkipped ? <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">Q{i + 1}. {q.question}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : `Your answer: ${studentAns}`} · Correct: {q.correctAnswer}
                      </p>
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </button>
                  {expanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-border animate-fade-in">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {(['A', 'B', 'C', 'D'] as const).map(opt => (
                          <div key={opt} className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 ${
                            opt === q.correctAnswer ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/30' :
                            opt === studentAns && opt !== q.correctAnswer ? 'bg-destructive/10 text-destructive border border-destructive/30' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            <span className="font-bold">{opt}.</span> {q.options[opt]}
                            {opt === q.correctAnswer && <CheckCircle2 className="h-3 w-3 ml-auto shrink-0" />}
                            {opt === studentAns && opt !== q.correctAnswer && <XCircle className="h-3 w-3 ml-auto shrink-0" />}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="bg-accent/50 rounded-lg p-3">
                          <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Explanation</p>
                          <p className="text-xs text-foreground">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center pb-6">
          <Button variant="outline" onClick={() => navigate('/student')} className="rounded-xl">Back to Dashboard</Button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;
