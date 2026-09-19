import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await api.newsBySlug(slug);
        if (!active) return;
        setArticle(data.article);
      } catch (err) {
        setError(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <PageLoader label="Loading article" />;

  if (error || !article) {
    return (
      <section className="container-page py-24">
        <ErrorState
          title="Article not found"
          message="This story may have been removed or is no longer published."
          onRetry={() => window.location.reload()}
        />
      </section>
    );
  }

  return (
    <article>
      <div className="container-page pt-10 lg:pt-16">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-400 transition-colors hover:text-gold-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All news
        </Link>
      </div>

      {article.cover_image_url && (
        <div className="container-page mt-8">
          <div className="relative aspect-[16/9] overflow-hidden border border-white/[0.06] sm:aspect-[21/9]">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
          </div>
        </div>
      )}

      <div className="container-page mx-auto max-w-3xl py-10 lg:py-16">
        <div className="flex items-center gap-3">
          {article.category && (
            <span className="border border-gold-500/40 px-2.5 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300">
              {article.category}
            </span>
          )}
          <span className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.15em] text-silver-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.published_at || article.created_at)}
          </span>
        </div>

        <h1 className="mt-5 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl text-balance">
          {article.title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-silver-400 sm:text-lg">{article.excerpt}</p>
        <p className="mt-6 font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">By {article.author}</p>

        <div className="mt-10 space-y-6 text-[15px] leading-[1.8] text-silver-300">
          {article.content.split('\n').map((para, i) =>
            para.trim() ? (
              <p key={i}>{para}</p>
            ) : (
              <span key={i} className="block" aria-hidden="true" />
            )
          )}
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-silver-400">Interested in what happens behind closed doors?</p>
            <Button to="/apply" variant="outline" size="sm">
              Apply for Membership
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
