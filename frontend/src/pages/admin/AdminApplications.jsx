import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import api from '../../lib/api';
import { useDebounce } from '../../hooks/useAsync';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { Pagination, EmptyState, PageLoader } from '../../components/ui/Feedback';
import { AdminPageHeader } from '../../components/admin/Parts';
import { formatDate } from '../../lib/utils';

export default function AdminApplications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.adminApplications({ page, status, search: debouncedSearch, limit: 15 });
        if (!active) return;
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        /* empty state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page, status, debouncedSearch]);

  const columns = [
    {
      key: 'full_name',
      label: 'Applicant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.profile_photo_url} name={row.full_name} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-silver-100">{row.full_name}</p>
            <p className="truncate font-mono text-2xs text-silver-500">@{row.username}</p>
          </div>
        </div>
      ),
    },
    { key: 'email', label: 'Email', cellClassName: 'hidden md:table-cell' },
    {
      key: 'application_code',
      label: 'Application ID',
      render: (row) => <span className="font-mono text-xs text-silver-300">{row.application_code}</span>,
      cellClassName: 'hidden lg:table-cell',
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-xs text-silver-400">{formatDate(row.created_at)}</span>,
      cellClassName: 'hidden sm:table-cell',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Applications"
        description="Every membership application is reviewed here. Approval is the only path in."
      />

      <div className="flex flex-col gap-3 border border-white/[0.06] bg-ink-850 p-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name, email or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          aria-label="Search applications"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-44" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications"
          description={status === 'pending' ? 'The review queue is clear.' : 'No applications match these filters.'}
        />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850">
          <Table columns={columns} data={items} onRowClick={(row) => navigate(`/admin/applications/${row.id}`)} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
