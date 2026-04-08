import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { RecommendationProvider } from './contexts/RecommendationContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RecommendationProvider>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" theme="dark" />
        </RecommendationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
