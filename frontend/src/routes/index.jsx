import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RequireAdmin, RequireMember, RedirectAuthenticated } from './guards';
import { PublicLayout } from '../layouts/PublicLayout';
import { MemberLayout } from '../layouts/MemberLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { usePageTitle } from '../hooks/usePageTitle';

/** Wraps a lazy page so the browser tab gets a per-page title. */
function Titled({ title, children }) {
  usePageTitle(title);
  return children;
}

// Public
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Membership = lazy(() => import('../pages/public/Membership'));
const Apply = lazy(() => import('../pages/public/Apply'));
const NewsList = lazy(() => import('../pages/public/NewsList'));
const NewsDetail = lazy(() => import('../pages/public/NewsDetail'));
const Events = lazy(() => import('../pages/public/Events'));
const Verify = lazy(() => import('../pages/public/Verify'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const Unauthorized = lazy(() => import('../pages/public/Unauthorized'));

// Auth
const Login = lazy(() => import('../pages/auth/Login'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Member
const MemberDashboard = lazy(() => import('../pages/member/MemberDashboard'));
const MemberIDCard = lazy(() => import('../pages/member/MemberIDCard'));
const MemberAnnouncements = lazy(() => import('../pages/member/MemberAnnouncements'));
const MemberEvents = lazy(() => import('../pages/member/MemberEvents'));
const Vault = lazy(() => import('../pages/member/Vault'));
const VaultItem = lazy(() => import('../pages/member/VaultItem'));
const MemberProfile = lazy(() => import('../pages/member/MemberProfile'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminApplications = lazy(() => import('../pages/admin/AdminApplications'));
const AdminApplicationDetail = lazy(() => import('../pages/admin/AdminApplicationDetail'));
const AdminMembers = lazy(() => import('../pages/admin/AdminMembers'));
const AdminMemberDetail = lazy(() => import('../pages/admin/AdminMemberDetail'));
const AdminIDCards = lazy(() => import('../pages/admin/AdminIDCards'));
const AdminNews = lazy(() => import('../pages/admin/AdminNews'));
const AdminNewsEditor = lazy(() => import('../pages/admin/AdminNewsEditor'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
const AdminEvents = lazy(() => import('../pages/admin/AdminEvents'));
const AdminVault = lazy(() => import('../pages/admin/AdminVault'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminVerification = lazy(() => import('../pages/admin/AdminVerification'));
const AdminActivity = lazy(() => import('../pages/admin/AdminActivity'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

export const routes = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <Titled title="About"><About /></Titled> },
      { path: '/membership', element: <Titled title="Membership"><Membership /></Titled> },
      { path: '/news', element: <Titled title="News"><NewsList /></Titled> },
      { path: '/news/:slug', element: <NewsDetail /> },
      { path: '/events', element: <Titled title="Events"><Events /></Titled> },
      { path: '/verify', element: <Titled title="Verify Membership"><Verify /></Titled> },
      { path: '/verify/:memberId', element: <Titled title="Verify Membership"><Verify /></Titled> },
      { path: '/unauthorized', element: <Titled title="Access Denied"><Unauthorized /></Titled> },
      { path: '/pending', element: <Titled title="Application Pending"><Unauthorized status="pending" /></Titled> },
      { path: '/rejected', element: <Titled title="Application Rejected"><Unauthorized status="rejected" /></Titled> },
      { path: '/suspended', element: <Titled title="Account Suspended"><Unauthorized status="suspended" /></Titled> },
      { path: '/login', element: <RedirectAuthenticated><Titled title="Sign In"><Login /></Titled></RedirectAuthenticated> },
      { path: '/reset-password', element: <Titled title="Reset Password"><ResetPassword /></Titled> },
      { path: '/apply', element: <Titled title="Apply"><Apply /></Titled> },
    ],
  },
  {
    element: (
      <RequireMember>
        <MemberLayout />
      </RequireMember>
    ),
    children: [
      { path: '/member', element: <Titled title="Dashboard"><MemberDashboard /></Titled> },
      { path: '/member/id-card', element: <Titled title="My ID Card"><MemberIDCard /></Titled> },
      { path: '/member/announcements', element: <Titled title="Announcements"><MemberAnnouncements /></Titled> },
      { path: '/member/events', element: <Titled title="Events"><MemberEvents /></Titled> },
      { path: '/member/vault', element: <Titled title="Vault"><Vault /></Titled> },
      { path: '/member/vault/:slug', element: <VaultItem /> },
      { path: '/member/profile', element: <Titled title="Profile"><MemberProfile /></Titled> },
    ],
  },
  {
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { path: '/admin', element: <Titled title="Admin — Dashboard"><AdminDashboard /></Titled> },
      { path: '/admin/applications', element: <Titled title="Admin — Applications"><AdminApplications /></Titled> },
      { path: '/admin/applications/:id', element: <AdminApplicationDetail /> },
      { path: '/admin/members', element: <Titled title="Admin — Members"><AdminMembers /></Titled> },
      { path: '/admin/members/:id', element: <AdminMemberDetail /> },
      { path: '/admin/id-cards', element: <Titled title="Admin — ID Cards"><AdminIDCards /></Titled> },
      { path: '/admin/news', element: <Titled title="Admin — News"><AdminNews /></Titled> },
      { path: '/admin/news/new', element: <Titled title="Admin — New Article"><AdminNewsEditor /></Titled> },
      { path: '/admin/news/:id/edit', element: <AdminNewsEditor /> },
      { path: '/admin/announcements', element: <Titled title="Admin — Announcements"><AdminAnnouncements /></Titled> },
      { path: '/admin/events', element: <Titled title="Admin — Events"><AdminEvents /></Titled> },
      { path: '/admin/vault', element: <Titled title="Admin — Vault"><AdminVault /></Titled> },
      { path: '/admin/notifications', element: <Titled title="Admin — Notifications"><AdminNotifications /></Titled> },
      { path: '/admin/verification', element: <Titled title="Admin — Verification"><AdminVerification /></Titled> },
      { path: '/admin/activity', element: <Titled title="Admin — Activity"><AdminActivity /></Titled> },
      { path: '/admin/settings', element: <Titled title="Admin — Settings"><AdminSettings /></Titled> },
    ],
  },
  { path: '*', element: <Titled title="Not Found"><NotFound /></Titled> },
];
