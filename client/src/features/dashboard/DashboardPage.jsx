import { useQuery } from '@tanstack/react-query';
import { Boxes, AlertTriangle, Wrench, UserX } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-primary bg-primary/10',
    warning: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
    destructive: 'text-destructive bg-destructive/10',
  };
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value ?? '—'}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.summary });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || ''}`}
        description="Operational summary across all registered assets and open issues."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total assets" value={summary?.totalAssets} icon={Boxes} />
          <StatCard label="Open issues" value={summary?.openIssues} icon={Wrench} tone="warning" />
          <StatCard label="Critical open issues" value={summary?.criticalOpenIssues} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Unassigned issues" value={summary?.unassignedIssues} icon={UserX} tone="warning" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary?.assetsByStatus &&
              Object.entries(summary.assetsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Issues by status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary?.issuesByStatus &&
              Object.entries(summary.issuesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
