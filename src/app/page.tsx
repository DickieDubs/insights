
export const runtime = 'edge';

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the dashboard page.
  // The ProtectedRoute component will handle redirecting
  // unauthenticated users to /login.
  redirect('/dashboard');
}
