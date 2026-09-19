import { Suspense } from 'react';
import { Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PageLoader } from './components/ui/Feedback';
import { routes } from './routes';

export default function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader label="Loading" />} key={location.pathname}>
          <Routes>{routes}</Routes>
        </Suspense>
      </AuthProvider>
    </ToastProvider>
  );
}
