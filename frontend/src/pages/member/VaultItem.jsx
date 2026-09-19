import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import api from '../../lib/api';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';

export default function VaultItem() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const data = await api.vaultItem(slug);
        if (!active) return;
        setItem(data.item);
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

  if (loading) return <PageLoader label="Loading" />;

  if (error || !item) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          title="Vault item not found"
          message="This content may have been removed or your membership may no longer be active."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to="/member/vault"
        className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> The Vault
      </Link>

      <div className="mt-8 flex items-center gap-2">
        <Lock className="h-4 w-4 text-gold-300" />
        <span className="font-mono text-2xs uppercase tracking-[0.25em] text-gold-400">{item.category}</span>
      </div>

      <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl text-balance">{item.title}</h1>
      <p className="mt-5 text-base leading-relaxed text-silver-400">{item.excerpt}</p>

      {item.cover_image_url && (
        <div className="mt-8 aspect-[16/9] overflow-hidden border border-white/[0.06]">
          <img src={item.cover_image_url} alt={item.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="mt-10 space-y-6 text-[15px] leading-[1.8] text-silver-300">
        {item.content.split('\n').map((para, i) =>
          para.trim() ? <p key={i}>{para}</p> : <span key={i} className="block" aria-hidden="true" />
        )}
      </div>
    </article>
  );
}
