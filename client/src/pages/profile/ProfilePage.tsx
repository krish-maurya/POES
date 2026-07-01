import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/Breadcrumb';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account information" />

      <Card className="max-w-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-2xl font-bold text-primary">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{user.email}</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge key={role} variant="default">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <dl className="mt-8 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">User ID</dt>
            <dd className="mt-1 text-sm text-white">{user.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
            <dd className="mt-1 text-sm text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Roles</dt>
            <dd className="mt-1 text-sm text-white">{user.roles.join(', ')}</dd>
          </div>
          {user.supplierCode && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                Supplier Code
              </dt>
              <dd className="mt-1 text-sm text-white">{user.supplierCode}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
