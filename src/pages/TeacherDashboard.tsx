import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { getTeacherStats, getExamsByTeacher, deleteExam, Exam, getResultsByExam } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Users, TrendingUp, Trash2, Eye, MoreVertical, BookOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState({ totalExams: 0, published: 0, totalStudents: 0, avgScore: 0, passRate: 0, totalAttempts: 0 });

  const refresh = () => {
    if (!user) return;
    setExams(getExamsByTeacher(user.id));
    setStats(getTeacherStats(user.id));
  };

  useEffect(refresh, [user]);

  const handleDelete = (id: string) => {
    deleteExam(id);
    toast({ title: 'Exam deleted' });
    refresh();
  };

  return (
    <DashboardLayout title="Teacher Dashboard" subtitle="Manage your exams and view student performance">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Exams" value={stats.totalExams} icon={FileText} color="primary" />
          <StatCard title="Published" value={stats.published} icon={BookOpen} color="success" />
          <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="warning" />
          <StatCard title="Avg Score" value={`${stats.avgScore}%`} icon={TrendingUp} subtitle={`${stats.passRate}% pass rate`} color="primary" />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Exams</h2>
          <Button onClick={() => navigate('/teacher/create')} className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" /> Create Exam
          </Button>
        </div>

        {exams.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No exams yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first exam to get started</p>
            <Button onClick={() => navigate('/teacher/create')} className="mt-4 rounded-xl" size="sm">
              <Plus className="mr-1 h-3 w-3" /> Create Exam
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {exams.map((exam) => {
              const results = getResultsByExam(exam.id);
              return (
                <div key={exam.id} className="surface-card surface-card-hover p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{exam.title}</p>
                      <Badge variant={exam.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">{exam.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exam.subject} · {exam.questions.length} questions · {exam.duration} min · {results.length} attempts
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/teacher/exam/${exam.id}`)}><Eye className="mr-2 h-3.5 w-3.5" /> View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(exam.id)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
