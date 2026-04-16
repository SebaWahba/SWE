import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { RecommendationProvider } from './contexts/RecommendationContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RecommendationProvider>
          <ProfileProvider>
            <RouterProvider router={router} />
            <Toaster position="bottom-right" theme="dark" />
          </ProfileProvider>
        </RecommendationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
