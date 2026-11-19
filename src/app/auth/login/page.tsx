import { AccountForm } from '@/components/auth/AccountForm';

export default function LoginPage({ searchParams }: PageProps<'/auth/login'>) {
  return <AccountForm searchParams={searchParams} />;
}
