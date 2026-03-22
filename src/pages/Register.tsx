import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, ArrowRight, Eye, EyeOff, BookOpen, Users } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast({ title: 'Password must be at least 6 characters', variant: 'destructive' }); return; }
    setLoading(true);
    setTimeout(() => {
      const result = register(name, email, password, role);
      if (result.success) {
        toast({ title: 'Account created!' });
        navigate('/');
      } else {
        toast({ title: result.message, variant: 'destructive' });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">ExamPortal</span>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Join the examination platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                {([['student', 'Student', BookOpen], ['teacher', 'Teacher', Users]] as const).map(([r, label, Icon]) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${role === r ? 'border-primary bg-accent text-primary ring-2 ring-primary/20' : 'border-border bg-card text-muted-foreground hover:border-primary/30'}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">Full Name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 rounded-xl pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold">
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
