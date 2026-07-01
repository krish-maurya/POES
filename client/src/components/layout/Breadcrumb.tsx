import { Link, useLocation } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';

interface BreadcrumbProps {
  items: { label: string; path?: string }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-1 text-sm text-muted">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 && <MdChevronRight className="h-4 w-4" />}
          {item.path && item.path !== location.pathname ? (
            <Link to={item.path} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; path?: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
