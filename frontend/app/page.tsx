import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard immediately.
  // Middleware will catch this and route to /login if unauthenticated.
  redirect('/dashboard');
}
