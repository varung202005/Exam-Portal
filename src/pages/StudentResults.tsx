import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getResultsByStudent, ExamResult } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

const StudentResults = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    if (user) setResults(getResultsByStudent(user.id).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  }, [user]);

  return (
    <DashboardLayout title="My Results" subtitle="View your exam results and performance">
      <div className="max-w-4xl mx-auto">
        {results.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No results yet</p>
            <p className="text-xs text-muted-foreground mt-1">Take an exam to see your results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.id} className="surface-card surface-card-hover p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${r.passed ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                  <span className={`text-lg font-bold ${r.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>{r.percentage}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.examTitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {r.correctAnswers}</span>
                    <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {r.wrongAnswers}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.round(r.timeTaken / 60)} min</span>
                  </div>
                </div>
                <Badge variant={r.passed ? 'default' : 'destructive'} className="shrink-0 text-[10px]">{r.passed ? 'PASS' : 'FAIL'}</Badge>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/result/${r.id}`)} className="rounded-lg shrink-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;
