import { AccountForm } from '@/components/auth/AccountForm';

export default function RegisterPage({ searchParams }: PageProps<'/auth/register'>) {
  return <AccountForm signup searchParams={searchParams} />;
}
