import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getStudentStats } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Brain, Lightbulb } from 'lucide-react';

const StudentPerformance = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReturnType<typeof getStudentStats> | null>(null);

  useEffect(() => {
    if (user) setStats(getStudentStats(user.id));
  }, [user]);

  if (!stats || stats.examsTaken === 0) return (
    <DashboardLayout title="Performance" subtitle="Detailed analytics of your exam performance">
      <div className="surface-card p-12 text-center max-w-lg mx-auto">
        <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">No data yet</p>
        <p className="text-xs text-muted-foreground mt-1">Complete some exams to see your analytics</p>
      </div>
    </DashboardLayout>
  );

  const trendData = stats.results
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .map((r, i) => ({ name: `Exam ${i + 1}`, score: r.percentage, subject: r.subject }));

  const topicData = Object.entries(stats.topicStats)
    .map(([topic, { correct, total }]) => ({ topic, accuracy: Math.round((correct / total) * 100), total }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const overallCorrect = stats.results.reduce((a, r) => a + r.correctAnswers, 0);
  const overallWrong = stats.results.reduce((a, r) => a + r.wrongAnswers, 0);
  const overallSkipped = stats.results.reduce((a, r) => a + r.skipped, 0);
  const overallPie = [
    { name: 'Correct', value: overallCorrect, color: 'hsl(142, 76%, 36%)' },
    { name: 'Wrong', value: overallWrong, color: 'hsl(0, 84%, 60%)' },
    { name: 'Skipped', value: overallSkipped, color: 'hsl(220, 9%, 70%)' },
  ];

  const weakTopics = topicData.filter(t => t.accuracy < 60);
  const strongTopics = topicData.filter(t => t.accuracy >= 80);

  return (
    <DashboardLayout title="Performance" subtitle="Detailed analytics of your exam performance">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="surface-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{stats.examsTaken}</p><p className="text-[10px] text-muted-foreground">Exams Taken</p></div>
          <div className="surface-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p><p className="text-[10px] text-muted-foreground">Average Score</p></div>
          <div className="surface-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{stats.bestScore}%</p><p className="text-[10px] text-muted-foreground">Best Score</p></div>
          <div className="surface-card p-4 text-center"><p className="text-2xl font-bold text-foreground">{stats.passRate}%</p><p className="text-[10px] text-muted-foreground">Pass Rate</p></div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-primary" /> Score Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(243, 75%, 59%)" strokeWidth={2.5} dot={{ fill: 'hsl(243, 75%, 59%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="surface-card p-4">
            <h3 className="text-xs font-semibold text-foreground mb-3">Overall Accuracy</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={overallPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {overallPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic performance */}
        <div className="surface-card p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" /> Topic-wise Performance</h3>
          <ResponsiveContainer width="100%" height={Math.max(150, topicData.length * 40)}>
            <BarChart data={topicData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="topic" width={100} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {topicData.map((entry, i) => (
                  <Cell key={i} fill={entry.accuracy >= 80 ? 'hsl(142, 76%, 36%)' : entry.accuracy >= 60 ? 'hsl(243, 75%, 59%)' : entry.accuracy >= 40 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakTopics.length > 0 && (
            <div className="surface-card p-4 border-amber-500/20">
              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Needs Improvement</h3>
              <div className="space-y-2">
                {weakTopics.map(t => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{t.topic}</span>
                    <span className="text-xs font-bold text-destructive">{t.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {strongTopics.length > 0 && (
            <div className="surface-card p-4 border-emerald-500/20">
              <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Strong Topics</h3>
              <div className="space-y-2">
                {strongTopics.map(t => (
                  <div key={t.topic} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{t.topic}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t.accuracy}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentPerformance;
