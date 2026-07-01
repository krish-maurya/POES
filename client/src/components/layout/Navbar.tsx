import { useNavigate } from 'react-router-dom';
import { MdLogout, MdNotifications, MdSearch } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store';
import { MobileMenuButton } from './Sidebar';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <MobileMenuButton />
        <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm text-muted md:flex md:w-80">
          <MdSearch className="h-4 w-4" />
          <span>Search...</span>
          <kbd className="ml-auto rounded bg-surface-hover px-1.5 py-0.5 text-xs">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-white"
          aria-label="Notifications"
        >
          <MdNotifications className="h-5 w-5" />
        </button>
        {user && (
          <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <MdLogout className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
