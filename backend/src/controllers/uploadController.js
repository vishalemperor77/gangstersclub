const { supabaseAdmin } = require('../config/supabase');
const { upload, buildFileName, uploadLimiter } = require('../middleware/upload');

/** POST /api/upload — authenticated image upload (avatars / covers) */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(422).json({ error: 'No file provided' });

    const folder = ['avatar', 'cover'].includes(req.body?.folder) ? req.body.folder : 'avatar';
    const bucket = folder === 'avatar' ? 'avatars' : 'media';
    const fileName = buildFileName(req.user.id, req.file.mimetype);
    const filePath = `${folder === 'avatar' ? '' : folder + '/'}${fileName}`;

    const { error: upErr } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (upErr) return res.status(400).json({ error: upErr.message });

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    return res.status(201).json({ url: data.publicUrl, path: filePath, bucket });
  } catch (err) {
    return next(err);
  }
}

module.exports = { uploadImage, uploadMiddleware: upload.single('file'), uploadLimiter };
