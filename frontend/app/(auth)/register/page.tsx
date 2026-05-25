'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(
        apiError?.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-2xl lg:text-3xl font-bold font-syne text-text-primary tracking-tight">
          Create your account
        </h3>
        <p className="text-sm text-text-secondary mt-1.5 font-dm-sans">
          Join CampusOS and get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="register-name" required>
            Full Name
          </Label>
          <Input
            id="register-name"
            placeholder="John Doe"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-email" required>
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@university.edu"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="register-password" required>
            Password
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, mixed case, number, special"
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

        <div className="space-y-1">
          <Label htmlFor="register-confirm" required>
            Confirm Password
          </Label>
          <Input
            id="register-confirm"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <div className="pt-4 space-y-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Button>

          <p className="text-sm text-text-secondary text-center font-dm-sans">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
