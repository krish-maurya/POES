import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
        <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted lg:px-8">
          © {new Date().getFullYear()} POES — Purchase Order & Enterprise System
        </footer>
      </div>
    </div>
  );
}
