import { useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';

export default function MemberProfile() {
  const { profile, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5MB or smaller.');
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type))
      return toast.error('Unsupported format. Use JPG, PNG, WebP or AVIF.');

    try {
      setUploading(true);
      const res = await api.upload(file, 'avatar');
      if (res.error) throw new Error(res.error);
      setForm((f) => ({ ...f, avatar_url: res.url }));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.full_name.trim().length < 2) next.full_name = 'Full name is required';
    if (form.username.trim().length < 3) next.username = 'At least 3 characters';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    try {
      setSaving(true);
      await api.updateProfile(form);
      await refresh();
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Account</p>
        <h1 className="mt-3 font-display text-3xl">Profile</h1>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          <Avatar src={form.avatar_url} name={form.full_name} size={72} />
          <div>
            <label
              htmlFor="avatar"
              className="inline-flex cursor-pointer items-center gap-2 border border-white/15 px-4 py-2 font-mono text-2xs uppercase tracking-[0.15em] text-silver-200 transition-colors hover:border-gold-500/50 hover:text-gold-300"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading…' : 'Change photo'}
            </label>
            <input id="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onUpload} className="sr-only" />
            <p className="mt-2 text-xs text-silver-500">JPG / PNG / WebP · max 5MB</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="full_name" required error={errors.full_name}>
              <Input id="full_name" name="full_name" value={form.full_name} onChange={onChange} error={errors.full_name} />
            </Field>
            <Field label="Username" htmlFor="username" required error={errors.username}>
              <Input id="username" name="username" value={form.username} onChange={onChange} error={errors.username} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} />
            </Field>
            <Field label="City" htmlFor="city" error={errors.city}>
              <Input id="city" name="city" value={form.city} onChange={onChange} error={errors.city} />
            </Field>
          </div>
          <Field label="Bio" htmlFor="bio" error={errors.bio}>
            <Textarea id="bio" name="bio" rows={4} value={form.bio} onChange={onChange} error={errors.bio} />
          </Field>

          <div className="flex justify-end border-t border-white/[0.06] pt-6">
            <Button type="submit" isLoading={saving}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-xs text-silver-600">
        Profile changes are visible to club administrators only.
      </p>
    </div>
  );
}
