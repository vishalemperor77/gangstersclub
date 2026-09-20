const express = require('express');
const { authRequired, optionalAuth } = require('../middleware/auth');
const { adminRequired, activeMemberRequired } = require('../middleware/rbac');
const { validate, paginationSchema } = require('../validators');

const auth = require('../controllers/authController');
const applications = require('../controllers/applicationController');
const adminApplications = require('../controllers/adminApplicationController');
const adminMembers = require('../controllers/adminMemberController');
const news = require('../controllers/newsController');
const announcements = require('../controllers/announcementController');
const events = require('../controllers/eventController');
const vault = require('../controllers/vaultController');
const notifications = require('../controllers/notificationController');
const activity = require('../controllers/activityController');
const verify = require('../controllers/verifyController');
const stats = require('../controllers/statsController');
const profile = require('../controllers/profileController');
const uploads = require('../controllers/uploadController');

const router = express.Router();

// ---- PUBLIC ---------------------------------------------------------------
router.get('/health', (req, res) => res.json({ status: 'ok', service: 'gangsters-club-api' }));
router.get('/public/stats', stats.getPublicStats);
router.get('/news', news.listPublicNews);
router.get('/news/:slug', news.getPublicNews);
router.get('/announcements', optionalAuth, announcements.listAnnouncements);
router.get('/events', optionalAuth, events.listPublicEvents);
router.get('/verify/lookup/:memberId', verify.verifyMember);

// ---- AUTHENTICATED -------------------------------------------------------
router.use(authRequired);

router.get('/auth/me', auth.me);
router.post('/auth/forgot-password', auth.forgotPassword);

router.post('/applications', validate(require('../validators').applicationSchema), applications.submitApplication);
router.get('/applications/mine', applications.myApplication);

router.get('/member/profile', profile.getMyProfile);
router.patch('/member/profile', profile.updateMyProfile);
router.get('/member/id-card', verify.myIdCard);

router.get('/notifications', notifications.listNotifications);
router.post('/notifications/read', notifications.markAllRead);
router.post('/notifications/:id/read', notifications.markOneRead);

router.post('/upload', uploads.uploadLimiter, uploads.uploadMiddleware, uploads.uploadImage);

// ---- ACTIVE MEMBER ONLY --------------------------------------------------
router.use(activeMemberRequired);

router.get('/vault', vault.listVault);
router.get('/vault/:slug', vault.getVaultItem);

router.get('/events/:id/rsvp', events.getRsvp);
router.post('/events/:id/rsvp', events.setRsvp);
router.delete('/events/:id/rsvp', events.cancelRsvp);

// ---- ADMIN ---------------------------------------------------------------
router.use(adminRequired);

router.get('/admin/stats', stats.getStats);
router.get('/admin/activity', validate(paginationSchema), activity.listActivity);

router.get('/admin/applications', validate(paginationSchema), adminApplications.listApplications);
router.get('/admin/applications/:id', adminApplications.getApplication);
router.post('/admin/applications/:id/approve', adminApplications.approveApplication);
router.post('/admin/applications/:id/reject', adminApplications.rejectApplication);

router.get('/admin/members', validate(paginationSchema), adminMembers.listMembers);
router.get('/admin/members/:id', adminMembers.getMember);
router.patch('/admin/members/:id', adminMembers.updateMember);
router.post('/admin/members/:id/suspend', adminMembers.suspendMember);
router.post('/admin/members/:id/reactivate', adminMembers.reactivateMember);
router.delete('/admin/members/:id', adminMembers.removeMember);

router.get('/admin/news', news.listAdminNews);
router.get('/admin/news/:id', news.getAdminNews);
router.post('/admin/news', validate(require('../validators').newsSchema), news.createNews);
router.patch('/admin/news/:id', validate(require('../validators').newsUpdateSchema), news.updateNews);
router.delete('/admin/news/:id', news.deleteNews);

router.get('/admin/announcements', announcements.listAdminAnnouncements);
router.post('/admin/announcements', validate(require('../validators').announcementSchema), announcements.createAnnouncement);
router.patch('/admin/announcements/:id', validate(require('../validators').announcementUpdateSchema), announcements.updateAnnouncement);
router.delete('/admin/announcements/:id', announcements.deleteAnnouncement);

router.get('/admin/events', events.listAdminEvents);
router.post('/admin/events', validate(require('../validators').eventSchema), events.createEvent);
router.patch('/admin/events/:id', validate(require('../validators').eventUpdateSchema), events.updateEvent);
router.delete('/admin/events/:id', events.deleteEvent);

router.get('/admin/vault', vault.listAdminVault);
router.post('/admin/vault', validate(require('../validators').vaultSchema), vault.createVaultItem);
router.patch('/admin/vault/:id', validate(require('../validators').vaultUpdateSchema), vault.updateVaultItem);
router.delete('/admin/vault/:id', vault.deleteVaultItem);

router.post('/admin/notifications', notifications.adminNotify);

module.exports = router;
