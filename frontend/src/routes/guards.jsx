import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Feedback';

export function RequireAuth({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verifying session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function RequireAdmin({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verifying session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children;
}

export function RequireMember({ children }) {
  const { loading, isAuthenticated, isActiveMember, profile, application } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Verifying membership" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Admins may review the member experience.
  if (isAdmin) return children;

  if (profile?.status === 'suspended' || application?.status === 'suspended') {
    return <Navigate to="/suspended" replace />;
  }
  if (application?.status === 'pending') return <Navigate to="/pending" replace />;
  if (application?.status === 'rejected') return <Navigate to="/rejected" replace />;
  if (!isActiveMember) return <Navigate to="/pending" replace />;

  return children;
}

/** Blocks already-authenticated users from auth pages (e.g. /login). */
export function RedirectAuthenticated({ children, to = '/member' }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <PageLoader label="Loading" />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin' : to} replace />;
  return children;
}
