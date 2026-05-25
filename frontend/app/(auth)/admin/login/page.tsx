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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const loginUser = useAuthStore((state) => state.login);
  const logoutUser = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
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
      
      // Wait a tick for the state to update, or check via an API response if we wanted to
      // Instead, we just check auth store right after, but since Zustand batches,
      // it's safer to rely on the fact that if it didn't throw, we are logged in.
      // But we must verify they are an admin.
      
      // To strictly verify role immediately after login returns:
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role !== Role.ADMIN) {
        await logoutUser();
        toast.error('Unauthorized access. This portal is for Administrators only.', {
          icon: <ShieldAlert className="h-5 w-5 text-red-500" />
        });
        return;
      }

      toast.success('Admin authentication successful', {
        icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />
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
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-4 ring-1 ring-red-500/20">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
        <p className="text-slate-400 mt-2">Restricted access area</p>
      </div>

      <Card className="border-red-900/30 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email" required className="text-slate-300">
                Administrator Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@university.edu"
                error={errors.email?.message}
                className="bg-slate-900/50 border-slate-800 focus-visible:ring-red-500"
                {...register('email')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password" required className="text-slate-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter secure password"
                  error={errors.password?.message}
                  className="bg-slate-900/50 border-slate-800 focus-visible:ring-red-500"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
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
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-6">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
              isLoading={isSubmitting}
            >
              Authenticate
            </Button>
            
            <p className="text-xs text-slate-500 text-center uppercase tracking-widest mt-2">
              Student or Faculty?{' '}
              <Link
                href="/login"
                className="text-slate-300 hover:text-white font-medium underline underline-offset-4 transition-colors"
              >
                Go to standard login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
