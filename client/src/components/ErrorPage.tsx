import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ErrorPage({ notFound = false }: { notFound?: boolean }) {
  const error = useRouteError();

  let status = 500;
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again.';

  if (notFound) {
    status = 404;
    title = 'Page not found';
    message = "The page you're looking for doesn't exist or has been moved.";
  } else if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = 'Page not found';
      message = "The page you're looking for doesn't exist or has been moved.";
    } else if (error.statusText) {
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <p className="text-sm font-mono text-red-400 mb-2">Error {status}</p>
        <h1 className="text-2xl font-semibold mb-3">{title}</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Link to="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
