import { useEffect, useState } from 'react';
import { Download, Share2, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageLoader, ErrorState } from '../../components/ui/Feedback';
import { formatMonthYear } from '../../lib/utils';

export default function MemberIDCard() {
  const { profile } = useAuth();
  const toast = useToast();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.idCard();
      setCard(data.card);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoader label="Generating ID card" />;

  if (error || !card) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          title="ID card unavailable"
          message={
            error?.message ||
            'Your membership is not active yet. Your ID card is issued when your application is approved.'
          }
          onRetry={load}
        />
      </div>
    );
  }

  const onDownload = async () => {
    try {
      toast.info('Preparing your ID card…');
      const { default: MemberCardImage } = await import('../../components/member/MemberCardImage');
      const dataUrl = await MemberCardImage(card);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `gangsters-club-${card.member_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ID card downloaded.');
    } catch (err) {
      toast.error('Could not generate the download.');
    }
  };

  const onShare = async () => {
    const url = card.qr_payload;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Gangsters Club — Member Verification', url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Verification link copied.');
      }
    } catch {
      toast.info('Share cancelled.');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Digital Member ID</p>
        <h1 className="mt-3 font-display text-3xl">Your card</h1>
        <p className="mt-3 text-sm text-silver-400">
          Present this card anywhere. Anyone can scan the QR code to verify your membership publicly.
        </p>
      </div>

      <div className="flex justify-center">
        <MemberCardVisual card={card} />
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={onDownload} size="md">
          <Download className="h-4 w-4" /> Download Card
        </Button>
        <Button onClick={onShare} variant="outline" size="md">
          <Share2 className="h-4 w-4" /> Share Verification Link
        </Button>
      </div>

      <div className="mt-10 border border-white/[0.06] bg-ink-850 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
          <div>
            <h3 className="text-sm font-medium text-silver-100">How verification works</h3>
            <p className="mt-2 text-xs leading-relaxed text-silver-400">
              The QR code on your card encodes a public link —{' '}
              <span className="font-mono text-silver-300">{card.qr_payload}</span>. Opening it performs a
              live lookup against the club registry and shows only your name, Member ID, status and join
              date. Your email, phone and date of birth are never exposed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** On-screen premium card rendering. */
export function MemberCardVisual({ card, className = '' }) {
  return (
    <div
      className={`relative w-full max-w-sm aspect-[1.586/1] overflow-hidden border border-gold-500/30 shadow-card ${className}`}
      style={{ background: 'linear-gradient(145deg, #141417 0%, #0a0a0b 45%, #1a1a1e 100%)' }}
    >
      {/* Metal sheen + grain */}
      <div className="absolute inset-0 bg-metal opacity-60" />
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(200,162,75,0.18),transparent_70%)]" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-sm font-bold tracking-[0.28em] text-metal">GANGSTERS CLUB</p>
            <p className="mt-1 font-mono text-2xs uppercase tracking-[0.3em] text-silver-400">Private Member</p>
          </div>
          {card.avatar_url ? (
            <img src={card.avatar_url} alt={card.full_name} className="h-12 w-12 border border-gold-500/40 object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center border border-gold-500/40 bg-ink-900 font-mono text-xs text-gold-300">
              {(card.full_name || '?').slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Name</p>
            <p className="mt-0.5 truncate font-display text-lg text-silver-100">{card.full_name}</p>
            <p className="mt-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Member ID</p>
            <p className="mt-0.5 font-mono text-sm text-gold-300">{card.member_id}</p>
            <div className="mt-2 flex gap-4">
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Member Since</p>
                <p className="mt-0.5 font-mono text-xs text-silver-200">{formatMonthYear(card.member_since)}</p>
              </div>
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Status</p>
                <p
                  className={`mt-0.5 font-mono text-xs uppercase ${
                    card.status === 'active' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {card.status}
                </p>
              </div>
            </div>
          </div>
          {card.qr && (
            <div className="shrink-0 border border-white/15 bg-[#f5f0e4] p-1.5">
              <img src={card.qr} alt="Member verification QR code" className="h-20 w-20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
