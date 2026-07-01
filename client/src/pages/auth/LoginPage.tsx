import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store';
import type { LoginDto } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/utils/errors';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>();

  const onSubmit = async (data: LoginDto) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      setAuth(response.token, response.roles, rememberMe);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-surface-raised p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">POES</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Sign in to your account</h1>
          <p className="mt-1 text-sm text-muted">Purchase Order & Enterprise System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border bg-surface-raised text-primary focus:ring-primary"
            />
            Remember me
          </label>

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
