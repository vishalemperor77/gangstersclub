/** Requires an authenticated admin profile. Enforced server-side. */
function adminRequired(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden — administrator access required' });
  }
  return next();
}

/** Requires an authenticated profile with an ACTIVE membership. */
function activeMemberRequired(req, res, next) {
  if (!req.profile) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.profile.role === 'admin') return next();
  if (req.profile.status !== 'active') {
    return res.status(403).json({
      error: 'Membership not active',
      code: 'MEMBERSHIP_INACTIVE',
      status: req.profile.status,
    });
  }
  return next();
}

module.exports = { adminRequired, activeMemberRequired };
