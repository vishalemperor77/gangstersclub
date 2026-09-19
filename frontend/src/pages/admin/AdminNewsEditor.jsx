import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Input';
import { AdminPageHeader } from '../../components/admin/Parts';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';

export default function AdminNewsEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Club',
    author: 'Gangsters Club',
    cover_image_url: '',
    status: 'draft',
    featured: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return undefined;
    let active = true;
    (async () => {
      try {
        const data = await api.adminNewsItem(id);
        if (!active) return;
        setForm(data.article);
      } catch {
        toast.error('Could not load article.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEditing, toast]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onSubmit = async (e, status) => {
    e?.preventDefault?.();
    const next = {};
    if (form.title.trim().length < 3) next.title = 'Title is required';
    if (form.excerpt.trim().length < 10) next.excerpt = 'Add a short description';
    if (form.content.trim().length < 20) next.content = 'Content is too short';
    if (Object.keys(next).length) {
      setErrors(next);
      toast.error('Please correct the highlighted fields.');
      return;
    }

    try {
      setSaving(true);
      const payload = { ...form, status: status || form.status };
      if (isEditing) {
        await api.updateNews(id, payload);
        toast.success('Article saved.');
      } else {
        await api.createNews(payload);
        toast.success(status === 'published' ? 'Article published.' : 'Draft saved.');
      }
      navigate('/admin/news');
    } catch (err) {
      toast.error(err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading article" />;

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={isEditing ? 'Edit article' : 'New article'}
        description="Published articles appear on the public website immediately."
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-6" noValidate onSubmit={(e) => onSubmit(e)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" required error={errors.title} className="sm:col-span-2">
              <Input id="title" name="title" value={form.title} onChange={onChange} error={errors.title} />
            </Field>
            <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate">
              <Input id="slug" name="slug" value={form.slug} onChange={onChange} className="font-mono" />
            </Field>
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" value={form.category} onChange={onChange}>
                {['Club', 'Announcement', 'Interview', 'Report', 'Community'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Author" htmlFor="author">
              <Input id="author" name="author" value={form.author} onChange={onChange} />
            </Field>
            <Field label="Cover image URL" htmlFor="cover_image_url">
              <Input id="cover_image_url" name="cover_image_url" value={form.cover_image_url} onChange={onChange} className="font-mono" />
            </Field>
          </div>

          <Field label="Short Description" htmlFor="excerpt" required error={errors.excerpt}>
            <Textarea id="excerpt" name="excerpt" rows={2} value={form.excerpt} onChange={onChange} error={errors.excerpt} />
          </Field>

          <Field label="Full Content" htmlFor="content" required error={errors.content} hint="Line breaks are preserved.">
            <Textarea id="content" name="content" rows={10} value={form.content} onChange={onChange} error={errors.content} />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-silver-300">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={onChange}
              className="h-4 w-4 accent-gold-500"
            />
            Feature this article
          </label>

          <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/news')}>
              Cancel
            </Button>
            <Button type="button" variant="surface" isLoading={saving} onClick={(e) => onSubmit(e, 'draft')}>
              <Save className="h-4 w-4" /> Save Draft
            </Button>
            <Button type="submit" isLoading={saving}>
              {isEditing ? 'Save & Keep Status' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
