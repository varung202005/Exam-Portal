import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { getExam, getResultsByExam, updateExam } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Clock, Award, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(220, 9%, 46%)'];

const ExamDetails = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const exam = getExam(examId || '');
  const results = getResultsByExam(examId || '');

  if (!exam) return (
    <DashboardLayout title="Exam Not Found">
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">This exam doesn't exist.</p>
        <Button variant="outline" onClick={() => navigate('/teacher')} className="mt-4 rounded-xl">Go Back</Button>
      </div>
    </DashboardLayout>
  );

  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;

  const togglePublish = () => {
    updateExam({ ...exam, status: exam.status === 'published' ? 'draft' : 'published' });
    toast({ title: exam.status === 'published' ? 'Exam unpublished' : 'Exam published' });
    navigate(`/teacher/exam/${examId}`);
  };

  const pieData = [{ name: 'Passed', value: passed }, { name: 'Failed', value: failed }];
  const scoreDistribution = [
    { range: '0-20', count: results.filter(r => r.percentage <= 20).length },
    { range: '21-40', count: results.filter(r => r.percentage > 20 && r.percentage <= 40).length },
    { range: '41-60', count: results.filter(r => r.percentage > 40 && r.percentage <= 60).length },
    { range: '61-80', count: results.filter(r => r.percentage > 60 && r.percentage <= 80).length },
    { range: '81-100', count: results.filter(r => r.percentage > 80).length },
  ];

  return (
    <DashboardLayout title={exam.title} subtitle={`${exam.subject} · ${exam.questions.length} questions`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>{exam.status}</Badge>
              <span className="text-xs text-muted-foreground">{exam.duration} min · {exam.passingPercentage}% to pass</span>
            </div>
          </div>
          <Button variant="outline" onClick={togglePublish} className="rounded-xl" size="sm">
            {exam.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="surface-card p-4 text-center"><Users className="h-4 w-4 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{results.length}</p><p className="text-[10px] text-muted-foreground">Attempts</p></div>
          <div className="surface-card p-4 text-center"><Award className="h-4 w-4 text-emerald-500 mx-auto mb-1" /><p className="text-lg font-bold">{avgScore}%</p><p className="text-[10px] text-muted-foreground">Avg Score</p></div>
          <div className="surface-card p-4 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto mb-1" /><p className="text-lg font-bold">{passed}</p><p className="text-[10px] text-muted-foreground">Passed</p></div>
          <div className="surface-card p-4 text-center"><XCircle className="h-4 w-4 text-destructive mx-auto mb-1" /><p className="text-lg font-bold">{failed}</p><p className="text-[10px] text-muted-foreground">Failed</p></div>
        </div>

        {/* Charts */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Pass/Fail</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="surface-card p-4">
              <h3 className="text-xs font-semibold text-foreground mb-3">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={scoreDistribution}><XAxis dataKey="range" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="hsl(243, 75%, 59%)" radius={[4, 4, 0, 0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Student results */}
        {results.length > 0 && (
          <div className="surface-card overflow-hidden">
            <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Student Results</h3></div>
            <div className="divide-y divide-border">
              {results.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{r.studentName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{r.studentName}</p>
                    <p className="text-[11px] text-muted-foreground">{r.correctAnswers}/{r.totalQuestions} correct · {Math.round(r.timeTaken / 60)} min</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>{r.percentage}%</p>
                    <Badge variant={r.passed ? 'default' : 'destructive'} className="text-[9px]">{r.passed ? 'PASS' : 'FAIL'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="surface-card overflow-hidden">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Questions ({exam.questions.length})</h3></div>
          <div className="divide-y divide-border">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="p-4">
                <p className="text-sm font-medium text-foreground mb-2">Q{i + 1}. {q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div key={opt} className={`text-xs px-3 py-1.5 rounded-lg ${q.correctAnswer === opt ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium' : 'bg-secondary text-muted-foreground'}`}>
                      {opt}. {q.options[opt]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamDetails;
