import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import type { RegisterDto } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/utils/errors';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterDto>({ defaultValues: { role: 'Company' } });

  const role = watch('role');

  const onSubmit = async (data: RegisterDto) => {
    setLoading(true);
    try {
      const payload: RegisterDto = {
        ...data,
        supplierCode: data.role === 'Supplier' ? data.supplierCode : null,
      };
      await authService.register(payload);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
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
          <h1 className="mt-2 text-2xl font-bold text-white">Create an account</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <Select
            label="Role"
            options={[
              { value: 'Company', label: 'Company' },
              { value: 'Supplier', label: 'Supplier' },
            ]}
            error={errors.role?.message}
            {...register('role', { required: 'Role is required' })}
          />
          {role === 'Supplier' && (
            <Input
              label="Supplier Code"
              placeholder="Enter your assigned supplier code"
              error={errors.supplierCode?.message}
              {...register('supplierCode', {
                required: role === 'Supplier' ? 'Supplier code is required' : false,
              })}
            />
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
