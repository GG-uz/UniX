import Link from 'next/link';
import { Suspense } from 'react';
import { login, register, signout } from '@/lib/auth/actions';
import { supabase } from '@/lib/supabase/server';

const messages = new Map([
  ['confirm', 'Если регистрация доступна для этого адреса, проверьте почту. Откройте письмо в том же браузере.'],
  ['callback', 'Не удалось подтвердить сессию по ссылке. Если почта подтверждена, войдите с паролем.'],
  ['failed', 'Не удалось завершить регистрацию. Проверьте данные или попробуйте позже.'],
  ['profile', 'Профиль недоступен. Обратитесь к организатору.'],
  ['retry', 'Не удалось загрузить профиль. Попробуйте ещё раз.'],
  ['signout', 'Не удалось завершить сеанс. Повторите выход.'],
  ['university', 'Не удалось проверить университет. Выберите вуз из списка.'],
]);
type Query = Promise<{ status?: string | string[] }>;
type Props = { signup?: boolean; searchParams: Query };

async function Form({ signup, searchParams }: Props) {
  const { status } = await searchParams;
  const retryProfile = !signup && (status === 'profile' || status === 'retry');
  const client = await supabase();
  const directory = signup && client
    ? await client.from('universities').select('id,name').order('name') : null;
  const notice = !client ? 'Вход и регистрация пока не подключены.'
    : signup && !directory?.data?.length ? 'Справочник вузов пока недоступен.'
    : status === 'invalid' ? (signup ? 'Проверьте поля регистрации.' : 'Неверный адрес или пароль, либо почта не подтверждена.')
    : messages.get(typeof status === 'string' ? status : '');
  const input = 'block w-full mt-1 rounded border border-neutral-500 bg-transparent p-2';
  return (
    <section className="mx-auto max-w-md px-5 py-12 space-y-5">
      <h1 className="text-3xl font-bold">{signup ? 'Регистрация студента' : 'Вход в UniX'}</h1>
      {notice && <p role="status">{notice}</p>}
      {retryProfile &&
        <Link href="/profile" prefetch={false} className="block underline">Повторно открыть профиль</Link>}
      {client && (!signup || !!directory?.data?.length) && (
        <form action={signup ? register : login} className="space-y-4">
          {signup && <>
            <label className="block">Имя и фамилия<input className={input} name="full_name" autoComplete="name" required maxLength={100} /></label>
            <label className="block">Университет<select className={input} name="university_id" defaultValue="" required>
              <option value="" disabled>Выберите вуз</option>
              {directory?.data?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select></label>
          </>}
          <label className="block">Электронная почта<input className={input} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label className="block">{signup ? 'Пароль (от 12 символов)' : 'Пароль'}
            <input className={input} name="password" type="password" required minLength={signup ? 12 : undefined}
              maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} />
          </label>
          <button className="rounded bg-amber-400 px-4 py-2 font-bold text-black">{signup ? 'Зарегистрироваться' : 'Войти'}</button>
        </form>
      )}
      <Link className="block underline" href={signup ? '/auth/login' : '/auth/register'}>
        {signup ? 'Уже есть аккаунт? Войти' : 'Создать аккаунт студента'}
      </Link>
      {(retryProfile || status === 'signout') &&
        <form action={signout}><button>Выйти из аккаунта</button></form>}
    </section>
  );
}

export function AccountForm(props: Props) {
  return <Suspense fallback={<p>Загрузка формы…</p>}><Form {...props} /></Suspense>;
}
