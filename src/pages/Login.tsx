import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        toast({ title: 'Welcome back!' });
        navigate('/');
      } else {
        toast({ title: result.message, variant: 'destructive' });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-primary-foreground/20" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-primary-foreground/10" />
        </div>
        <div className="relative z-10 text-center max-w-md px-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary-foreground mb-3">ExamPortal</h1>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            A comprehensive online examination platform. Create, manage, and take exams with powerful analytics and insights.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[['1000+', 'Exams'], ['5000+', 'Students'], ['98%', 'Uptime']].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-bold text-primary-foreground">{val}</p>
                <p className="text-[11px] text-primary-foreground/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ExamPortal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 rounded-xl pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold">
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>

          {/* <div className="mt-8 p-3 rounded-xl bg-accent/50 border border-border">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">Demo accounts:</p> */}
            {/* <p className="text-[11px] text-muted-foreground">Teacher: teacher@test.com / password123</p> */}
            {/* <p className="text-[11px] text-muted-foreground">Student: student@test.com / password123</p> */}
          </div>
        </div>
      </div>
    // </div>
  );
};

export default Login;
