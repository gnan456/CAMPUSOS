'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
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
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your credentials.';

      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-2xl lg:text-3xl font-bold font-syne text-text-primary tracking-tight">
          Welcome back
        </h3>
        <p className="text-sm text-text-secondary mt-1.5 font-dm-sans">
          Sign in to your CampusOS account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="login-email" required>
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@university.edu"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="login-password" required>
            Password
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
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
            size="lg"
            isLoading={isSubmitting}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>

          <p className="text-sm text-text-secondary text-center font-dm-sans">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
