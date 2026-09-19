import { Suspense, useEffect } from 'react';
import { useLocation, useNavigationType, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PageLoader } from './components/ui/Feedback';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { routes } from './routes';

export default function App() {
  const location = useLocation();
  const navigationType = useNavigationType();

  // The route table in ./routes is plain route objects ({ path, element,
  // children }), which is exactly what useRoutes() consumes. <Routes> would
  // require <Route> elements and throws "Objects are not valid as a React
  // child" when given objects.
  const element = useRoutes(routes);

  // `ScrollRestoration` only works with a data router (createBrowserRouter),
  // which this app does not use. Mirror it in declarative mode: jump to the top
  // on a new navigation, and let the browser handle back/forward (POP).
  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, navigationType]);

  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageLoader label="Loading" />} key={location.pathname}>
            {element}
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
