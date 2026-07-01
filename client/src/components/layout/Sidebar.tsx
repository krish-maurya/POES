import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MdDashboard,
  MdInventory2,
  MdBusiness,
  MdShoppingCart,
  MdLocalShipping,
  MdSettings,
  MdNumbers,
  MdPerson,
  MdChevronLeft,
  MdMenu,
} from 'react-icons/md';
import { NAV_ITEMS } from '@/constants';
import { useAuthStore, useThemeStore } from '@/store';
import { cn } from '@/utils/cn';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MdDashboard,
  MdInventory2,
  MdBusiness,
  MdShoppingCart,
  MdLocalShipping,
  MdSettings,
  MdNumbers,
  MdPerson,
};

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const mobileOpen = useThemeStore((s) => s.mobileSidebarOpen);
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);
  const setMobileOpen = useThemeStore((s) => s.setMobileSidebarOpen);

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((role) => hasRole(role)),
  );

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">POES</p>
            <p className="text-sm font-bold text-white">Enterprise ERP</p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-white lg:block"
          aria-label="Toggle sidebar"
        >
          <MdChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-muted hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <MdChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:bg-surface-hover hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  )}
                  {Icon && <Icon className="h-5 w-5 shrink-0" />}
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user && !collapsed && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-hover p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.email}</p>
              <p className="truncate text-xs text-muted">{user.roles.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-surface lg:transition-all lg:duration-300',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export function MobileMenuButton() {
  const setMobileOpen = useThemeStore((s) => s.setMobileSidebarOpen);
  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-white lg:hidden"
      aria-label="Open menu"
    >
      <MdMenu className="h-6 w-6" />
    </button>
  );
}
