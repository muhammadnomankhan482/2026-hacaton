import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { issueApi } from '../../api/issueApi';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { IssueStatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { formatDate } from '../../lib/utils';
import { ISSUE_STATUS, PRIORITY } from '../../lib/constants';

export function IssuesListPage() {
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['issues', status, priority],
    queryFn: () =>
      issueApi.list({
        status: status === 'all' ? undefined : status,
        priority: priority === 'all' ? undefined : priority,
      }),
  });

  return (
    <div>
      <PageHeader title="Issues" description="Reported problems across all assets and their workflow status." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(ISSUE_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {Object.values(PRIORITY).map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !data?.items?.length ? (
        <EmptyState title="No issues found" description="Nothing matches these filters right now." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Reported</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((issue) => (
                <TableRow key={issue._id}>
                  <TableCell>
                    <Link to={`/app/issues/${issue._id}`} className="font-medium hover:underline">
                      {issue.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{issue.issueNumber}</p>
                  </TableCell>
                  <TableCell>{issue.asset?.name}</TableCell>
                  <TableCell>
                    <PriorityBadge priority={issue.priority} />
                  </TableCell>
                  <TableCell>
                    <IssueStatusBadge status={issue.status} />
                  </TableCell>
                  <TableCell>{issue.assignedTechnician?.name || '—'}</TableCell>
                  <TableCell>{formatDate(issue.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
