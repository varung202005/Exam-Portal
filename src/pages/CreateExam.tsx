import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { addExam, generateId, Question } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, Send, GripVertical, Upload, CheckCircle2 } from 'lucide-react';

const emptyQuestion = (): Question => ({
  id: generateId(), question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', explanation: '', topic: '', marks: 1,
});

const CreateExam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [passingPercentage, setPassingPercentage] = useState(40);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [activeQ, setActiveQ] = useState(0);
  const [bulkText, setBulkText] = useState('');

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions(qs => qs.map((q, i) => i === index ? { ...q, ...updates } : q));
  };

  const addQuestion = () => { setQuestions(qs => [...qs, emptyQuestion()]); setActiveQ(questions.length); };
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(qs => qs.filter((_, i) => i !== index));
    setActiveQ(Math.max(0, activeQ - 1));
  };

  const parseBulk = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    const parsed: Question[] = [];
    let i = 0;
    while (i < lines.length) {
      const qLine = lines[i]?.trim();
      if (!qLine) { i++; continue; }
      const a = lines[i + 1]?.replace(/^[Aa][.)]\s*/, '').trim() || '';
      const b = lines[i + 2]?.replace(/^[Bb][.)]\s*/, '').trim() || '';
      const c = lines[i + 3]?.replace(/^[Cc][.)]\s*/, '').trim() || '';
      const d = lines[i + 4]?.replace(/^[Dd][.)]\s*/, '').trim() || '';
      const ansLine = lines[i + 5]?.trim().toUpperCase() || 'A';
      const ans = (['A', 'B', 'C', 'D'].includes(ansLine) ? ansLine : 'A') as 'A' | 'B' | 'C' | 'D';
      parsed.push({ id: generateId(), question: qLine.replace(/^\d+[.)]\s*/, ''), options: { A: a, B: b, C: c, D: d }, correctAnswer: ans, explanation: '', topic: subject || 'General', marks: 1 });
      i += 6;
    }
    if (parsed.length > 0) {
      setQuestions(qs => [...qs.filter(q => q.question.trim()), ...parsed]);
      setBulkText('');
      toast({ title: `Imported ${parsed.length} questions` });
    } else {
      toast({ title: 'Could not parse questions. Check format.', variant: 'destructive' });
    }
  };

  const handleSave = (status: 'draft' | 'published') => {
    if (!title.trim() || !subject.trim()) { toast({ title: 'Fill in exam title and subject', variant: 'destructive' }); return; }
    const validQs = questions.filter(q => q.question.trim() && q.options.A.trim());
    if (validQs.length === 0) { toast({ title: 'Add at least one question', variant: 'destructive' }); return; }
    addExam({
      id: generateId(), title, subject, description, duration, teacherId: user!.id, teacherName: user!.name,
      questions: validQs, createdAt: new Date().toISOString(), status, passingPercentage,
    });
    toast({ title: status === 'published' ? 'Exam published!' : 'Exam saved as draft' });
    navigate('/teacher');
  };

  const q = questions[activeQ];

  return (
    <DashboardLayout title="Create Exam" subtitle="Set up your exam and add questions">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="surface-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Exam Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Title</Label>
              <Input placeholder="e.g. Midterm Examination" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Subject</Label><Input placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Duration (minutes)</Label><Input type="number" min={5} value={duration} onChange={e => setDuration(Number(e.target.value))} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Passing Percentage</Label><Input type="number" min={0} max={100} value={passingPercentage} onChange={e => setPassingPercentage(Number(e.target.value))} className="rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl min-h-[60px]" /></div>
          </div>
        </div>

        <Tabs defaultValue="manual">
          <TabsList className="mb-4"><TabsTrigger value="manual">Manual Entry</TabsTrigger><TabsTrigger value="bulk">Bulk Import</TabsTrigger></TabsList>
          <TabsContent value="manual">
            <div className="flex gap-4">
              <div className="hidden md:block w-48 shrink-0 space-y-2">
                <div className="surface-card p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Questions ({questions.length})</p>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {questions.map((qItem, i) => (
                      <button key={qItem.id} onClick={() => setActiveQ(i)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${i === activeQ ? 'bg-primary text-primary-foreground' : qItem.question.trim() ? 'bg-accent/50 text-foreground hover:bg-accent' : 'text-muted-foreground hover:bg-secondary'}`}>
                        <GripVertical className="h-3 w-3 shrink-0 opacity-40" />
                        <span className="truncate">Q{i + 1}{qItem.question.trim() ? `: ${qItem.question.substring(0, 20)}...` : ''}</span>
                        {qItem.question.trim() && qItem.options.A.trim() && <CheckCircle2 className="h-3 w-3 ml-auto shrink-0 opacity-60" />}
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addQuestion} className="w-full mt-2 rounded-lg text-xs"><Plus className="mr-1 h-3 w-3" /> Add Question</Button>
                </div>
              </div>

              <div className="flex-1 surface-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Question {activeQ + 1}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(activeQ)} disabled={questions.length <= 1} className="text-destructive text-xs"><Trash2 className="mr-1 h-3 w-3" /> Remove</Button>
                    <Button variant="outline" size="sm" onClick={addQuestion} className="md:hidden text-xs"><Plus className="mr-1 h-3 w-3" /> Add</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-xs">Question Text</Label><Textarea placeholder="Enter your question..." value={q.question} onChange={e => updateQuestion(activeQ, { question: e.target.value })} className="rounded-xl min-h-[80px]" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <div key={opt} className="space-y-1.5">
                        <Label className="text-xs">Option {opt}</Label>
                        <Input placeholder={`Option ${opt}`} value={q.options[opt]} onChange={e => updateQuestion(activeQ, { options: { ...q.options, [opt]: e.target.value } })} className={`rounded-xl ${q.correctAnswer === opt ? 'border-emerald-500 bg-emerald-500/5' : ''}`} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs">Correct Answer</Label>
                      <Select value={q.correctAnswer} onValueChange={v => updateQuestion(activeQ, { correctAnswer: v as 'A' | 'B' | 'C' | 'D' })}>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{['A', 'B', 'C', 'D'].map(o => <SelectItem key={o} value={o}>Option {o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Topic</Label><Input placeholder="e.g. Calculus" value={q.topic} onChange={e => updateQuestion(activeQ, { topic: e.target.value })} className="rounded-xl" /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Marks</Label><Input type="number" min={1} value={q.marks} onChange={e => updateQuestion(activeQ, { marks: Number(e.target.value) })} className="rounded-xl" /></div>
                  </div>
                  <div className="space-y-1.5"><Label className="text-xs">Explanation (shown in results)</Label><Textarea placeholder="Why is this the correct answer?" value={q.explanation} onChange={e => updateQuestion(activeQ, { explanation: e.target.value })} className="rounded-xl min-h-[60px]" /></div>
                  <div className="flex md:hidden items-center justify-between pt-2">
                    <Button variant="outline" size="sm" disabled={activeQ === 0} onClick={() => setActiveQ(activeQ - 1)} className="rounded-lg text-xs">Previous</Button>
                    <span className="text-xs text-muted-foreground">{activeQ + 1} / {questions.length}</span>
                    <Button variant="outline" size="sm" disabled={activeQ === questions.length - 1} onClick={() => setActiveQ(activeQ + 1)} className="rounded-lg text-xs">Next</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="bulk">
            <div className="surface-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-2">Bulk Import</h3>
              <p className="text-xs text-muted-foreground mb-3">Paste questions: Question text, then options A-D on separate lines, then correct answer letter. Repeat for each question.</p>
              <Textarea placeholder={"What is 2+2?\n4\n3\n5\n6\nA\n\nWhat color is the sky?\nGreen\nBlue\nRed\nYellow\nB"} value={bulkText} onChange={e => setBulkText(e.target.value)} className="rounded-xl min-h-[200px] font-mono text-xs" />
              <Button onClick={parseBulk} className="mt-3 rounded-xl" size="sm"><Upload className="mr-1 h-3 w-3" /> Import Questions</Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between py-2">
          <p className="text-xs text-muted-foreground">{questions.filter(q => q.question.trim()).length} of {questions.length} questions completed</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave('draft')} className="rounded-xl"><Save className="mr-1 h-4 w-4" /> Save Draft</Button>
            <Button onClick={() => handleSave('published')} className="rounded-xl"><Send className="mr-1 h-4 w-4" /> Publish Exam</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateExam;
