const { supabaseAdmin } = require('../config/supabase');

/**
 * Write an audit entry. Fire-and-forget — must never break the caller.
 */
function logActivity({ adminId, action, target = null, targetId = null, metadata = {} }) {
  supabaseAdmin
    .from('activity_logs')
    .insert({
      admin_id: adminId,
      action,
      target,
      target_id: targetId,
      metadata,
    })
    .then(({ error }) => {
      if (error) console.error('[activity] failed to log:', error.message);
    });
}

module.exports = { logActivity };
