import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { RequireAdmin, RequireMember, RedirectAuthenticated } from './guards';
import { PublicLayout } from '../layouts/PublicLayout';
import { MemberLayout } from '../layouts/MemberLayout';
import { AdminLayout } from '../layouts/AdminLayout';

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
      { path: '/about', element: <About /> },
      { path: '/membership', element: <Membership /> },
      { path: '/news', element: <NewsList /> },
      { path: '/news/:slug', element: <NewsDetail /> },
      { path: '/events', element: <Events /> },
      { path: '/verify', element: <Verify /> },
      { path: '/verify/:memberId', element: <Verify /> },
      { path: '/unauthorized', element: <Unauthorized /> },
      { path: '/pending', element: <Unauthorized status="pending" /> },
      { path: '/rejected', element: <Unauthorized status="rejected" /> },
      { path: '/suspended', element: <Unauthorized status="suspended" /> },
      { path: '/login', element: <RedirectAuthenticated><Login /></RedirectAuthenticated> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/apply', element: <Apply /> },
    ],
  },
  {
    element: (
      <RequireMember>
        <MemberLayout />
      </RequireMember>
    ),
    children: [
      { path: '/member', element: <MemberDashboard /> },
      { path: '/member/id-card', element: <MemberIDCard /> },
      { path: '/member/announcements', element: <MemberAnnouncements /> },
      { path: '/member/events', element: <MemberEvents /> },
      { path: '/member/vault', element: <Vault /> },
      { path: '/member/vault/:slug', element: <VaultItem /> },
      { path: '/member/profile', element: <MemberProfile /> },
    ],
  },
  {
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/applications', element: <AdminApplications /> },
      { path: '/admin/applications/:id', element: <AdminApplicationDetail /> },
      { path: '/admin/members', element: <AdminMembers /> },
      { path: '/admin/members/:id', element: <AdminMemberDetail /> },
      { path: '/admin/id-cards', element: <AdminIDCards /> },
      { path: '/admin/news', element: <AdminNews /> },
      { path: '/admin/news/new', element: <AdminNewsEditor /> },
      { path: '/admin/news/:id/edit', element: <AdminNewsEditor /> },
      { path: '/admin/announcements', element: <AdminAnnouncements /> },
      { path: '/admin/events', element: <AdminEvents /> },
      { path: '/admin/vault', element: <AdminVault /> },
      { path: '/admin/notifications', element: <AdminNotifications /> },
      { path: '/admin/verification', element: <AdminVerification /> },
      { path: '/admin/activity', element: <AdminActivity /> },
      { path: '/admin/settings', element: <AdminSettings /> },
    ],
  },
  { path: '*', element: <NotFound /> },
];
