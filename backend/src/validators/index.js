const { z } = require('zod');

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(80),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may only contain letters, numbers, . _ -'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().max(30).optional().or(z.literal('')),
  city: z.string().max(80).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  introduction: z.string().min(20, 'Tell us a little more about yourself (20+ characters)').max(2000),
  motivation: z.string().min(20, 'Explain why you want to join (20+ characters)').max(2000),
  terms_accepted: z.literal(true, { message: 'You must accept the terms and conditions' }),
  profile_photo_url: z.string().url().optional().or(z.literal('')),
});

const newsSchema = z.object({
  title: z.string().min(3, 'Title is required').max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens')
    .optional(),
  excerpt: z.string().min(10).max(400),
  content: z.string().min(20),
  category: z.string().max(40).optional(),
  author: z.string().max(80).optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
});

const announcementSchema = z.object({
  title: z.string().min(3).max(160),
  content: z.string().min(10).max(5000),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  target: z.enum(['all_members', 'public']).optional(),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
});

const eventSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(5000),
  event_date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  event_time: z.string().min(3),
  location: z.string().min(2).max(200),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['public', 'members']).optional(),
  rsvp_enabled: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
});

const vaultSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  category: z.string().max(40).optional(),
  excerpt: z.string().min(10).max(400),
  content: z.string().min(20),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'unpublished']).optional(),
});

const memberUpdateSchema = z.object({
  full_name: z.string().min(2).max(80).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.-]+$/)
    .optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  city: z.string().max(80).optional(),
  level: z.string().max(40).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({ ...req.body, ...req.query });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        fieldErrors[key] = issue.message;
      });
      return res.status(422).json({ error: 'Validation failed', fields: fieldErrors });
    }
    req.validated = result.data;
    return next();
  };
}

module.exports = {
  applicationSchema,
  newsSchema,
  announcementSchema,
  eventSchema,
  vaultSchema,
  memberUpdateSchema,
  paginationSchema,
  validate,
};
