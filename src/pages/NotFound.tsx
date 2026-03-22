import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="text-center">
      <p className="text-6xl font-bold text-primary/20 mb-2">404</p>
      <h1 className="text-xl font-bold text-foreground mb-1">Page Not Found</h1>
      <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Button asChild className="rounded-xl"><Link to="/"><Home className="mr-2 h-4 w-4" /> Go Home</Link></Button>
    </div>
  </div>
);

export default NotFound;
