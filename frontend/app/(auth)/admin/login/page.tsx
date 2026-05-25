'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);
  const logoutUser = useAuthStore((state) => state.logout);
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser(data.email, data.password);
      
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role !== Role.ADMIN) {
        await logoutUser();
        toast.error('Unauthorized access. This portal is for Administrators only.', {
          icon: <ShieldAlert className="h-5 w-5 text-error" />
        });
        return;
      }

      toast.success('Admin authentication successful', {
        icon: <ShieldCheck className="h-5 w-5 text-success" />
      });
      router.push('/dashboard');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError?.response?.data?.message || 'Authentication failed. Please try again.'
      );
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8 flex flex-col items-center select-none">
        <div className="inline-flex items-center justify-center p-3.5 bg-error/10 rounded-full mb-4 ring-1 ring-error/25">
          <ShieldAlert className="h-7 w-7 text-error animate-pulse" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold font-syne text-text-primary tracking-tight">Admin Portal</h3>
        <p className="text-sm text-text-secondary mt-1.5 font-dm-sans">Restricted access area</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="admin-email" required>
            Administrator Email
          </Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="admin@university.edu"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="admin-password" required>
            Password
          </Label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter secure password"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3.5 top-3 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            type="submit"
            className="w-full"
            variant="danger"
            size="lg"
            isLoading={isSubmitting}
          >
            Authenticate
          </Button>
          
          <p className="text-xs text-text-muted text-center uppercase tracking-widest font-mono">
            Student or Faculty?{' '}
            <Link
              href="/login"
              className="text-text-secondary hover:text-text-primary font-medium underline underline-offset-4 transition-colors"
            >
              Go to standard login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
