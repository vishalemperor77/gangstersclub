const { supabaseAdmin } = require('../config/supabase');
const config = require('../config/env');
const QRCode = require('qrcode');

/**
 * PUBLIC: GET /api/verify/lookup/:memberId
 * Returns only safe public fields. No email, phone, DOB or address.
 */
async function verifyMember(req, res, next) {
  try {
    const memberId = (req.params.memberId || '').trim().toUpperCase();

    if (!/^GC-\d{4}-\d{6}$/.test(memberId)) {
      return res.status(200).json({ valid: false, status: 'invalid', message: 'Invalid member ID format' });
    }

    const { data, error } = await supabaseAdmin.rpc('verify_member', { p_member_id: memberId });

    if (error) return next(error);
    if (!data || data.length === 0) {
      return res.status(200).json({ valid: false, status: 'invalid', message: 'No membership found for this Member ID' });
    }

    const row = data[0];

    if (row.status === 'suspended') {
      return res.status(200).json({
        valid: true,
        status: 'suspended',
        member_id: row.member_id,
        message: 'This membership is currently suspended.',
      });
    }

    if (row.status === 'inactive') {
      return res.status(200).json({
        valid: true,
        status: 'inactive',
        member_id: row.member_id,
        message: 'This membership is no longer active.',
      });
    }

    return res.status(200).json({
      valid: true,
      status: 'active',
      member_id: row.member_id,
      full_name: row.full_name,
      level: row.level,
      member_since: row.member_since,
      club: 'GANGSTERS CLUB',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * MEMBER: GET /api/member/id-card
 * Returns the member's ID card payload + generated QR data URL.
 */
async function myIdCard(req, res, next) {
  try {
    const { data: membership, error: mErr } = await supabaseAdmin
      .from('memberships')
      .select('id, member_id, status, level, member_since')
      .eq('user_id', req.user.id)
      .single();

    if (mErr || !membership) return res.status(404).json({ error: 'No membership found. Your application may still be under review.' });

    const { data: verification } = await supabaseAdmin
      .from('member_verification')
      .select('qr_payload')
      .eq('membership_id', membership.id)
      .limit(1)
      .maybeSingle();

    const qrPayload = verification?.qr_payload || `${config.publicUrl}/verify/${membership.member_id}`;
    const qr = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 480,
      color: { dark: '#0a0a0a', light: '#f5f0e4' },
      errorCorrectionLevel: 'H',
    });

    return res.json({
      card: {
        club: 'GANGSTERS CLUB',
        tier: 'PRIVATE MEMBER',
        full_name: req.profile.full_name,
        member_id: membership.member_id,
        level: membership.level,
        member_since: membership.member_since,
        status: membership.status,
        avatar_url: req.profile.avatar_url,
        qr_payload: qrPayload,
        qr,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { verifyMember, myIdCard };
