import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { getPublishedExams, getStudentStats, hasStudentAttempted, Exam, getResultsByStudent } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Award, Target, Clock, FileText, Play, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStudentStats> | null>(null);

  useEffect(() => {
    if (!user) return;
    setExams(getPublishedExams());
    setStats(getStudentStats(user.id));
  }, [user]);

  const performanceData = stats?.results
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .map((r, i) => ({ exam: `Exam ${i + 1}`, score: r.percentage })) || [];

  const weakTopics = stats?.topicStats
    ? Object.entries(stats.topicStats)
        .map(([topic, { correct, total }]) => ({ topic, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 }))
        .sort((a, b) => a.accuracy - b.accuracy).slice(0, 5)
    : [];

  return (
    <DashboardLayout title="Student Dashboard" subtitle="Track your progress and take exams">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Exams Taken" value={stats?.examsTaken || 0} icon={BookOpen} color="primary" />
          <StatCard title="Avg Score" value={`${stats?.avgScore || 0}%`} icon={TrendingUp} color="success" />
          <StatCard title="Best Score" value={`${stats?.bestScore || 0}%`} icon={Award} color="warning" />
          <StatCard title="Pass Rate" value={`${stats?.passRate || 0}%`} icon={Target} color="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {performanceData.length > 1 && (
            <div className="lg:col-span-2 surface-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={performanceData}>
                  <XAxis dataKey="exam" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(243, 75%, 59%)" strokeWidth={2} dot={{ fill: 'hsl(243, 75%, 59%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {weakTopics.length > 0 && (
            <div className="surface-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Topic Accuracy</h3>
              <div className="space-y-3">
                {weakTopics.map(t => (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground">{t.topic}</span>
                      <span className={`text-xs font-bold ${t.accuracy >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>{t.accuracy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${t.accuracy >= 60 ? 'bg-emerald-500' : t.accuracy >= 40 ? 'bg-amber-500' : 'bg-destructive'}`} style={{ width: `${t.accuracy}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Available Exams</h2>
          {exams.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No exams available</p>
              <p className="text-xs text-muted-foreground mt-1">Check back later for new exams</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map(exam => {
                const attempted = user ? hasStudentAttempted(user.id, exam.id) : false;
                return (
                  <div key={exam.id} className="surface-card surface-card-hover p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="h-4 w-4 text-primary" /></div>
                      {attempted && <Badge variant="secondary" className="text-[10px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Done</Badge>}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{exam.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{exam.subject}</p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {exam.duration} min</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {exam.questions.length} Qs</span>
                    </div>
                    {exam.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{exam.description}</p>}
                    <div className="mt-auto pt-3">
                      {attempted ? (
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" onClick={() => {
                          const results = getResultsByStudent(user!.id);
                          const result = results.find(r => r.examId === exam.id);
                          if (result) navigate(`/result/${result.id}`);
                        }}>View Result</Button>
                      ) : (
                        <Button size="sm" className="w-full rounded-xl text-xs" onClick={() => navigate(`/exam/${exam.id}`)}>
                          <Play className="mr-1 h-3 w-3" /> Start Exam
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
