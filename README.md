# UniSport League — Web MVP

**UniX 4.1:** [университетские вызовы, миграции, роли и локальные тесты](docs/university-challenges.md).
Реальные вызовы — `/challenges`; демонстрационная доска — `/demo/challenges`.

Inter-University Sports Matchmaking & Venue Booking Platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🚀 Key Features Built

1. **High-Energy Landing Page (`src/app/page.tsx`)**:
   - Modern dark athletic tech aesthetic with glowing accents.
   - Dynamic real-time metric counters (18+ Active Universities, 34 Upcoming Matches, 14 Partner Arenas, 0% No-Shows).
   - Instant search console: Filter by Sport (Football, Basketball, Volleyball) & Date -> Find Rival or Book Arena.
   - Live Challenge Ticker & Recent Final Scores stream.
   - Step-by-step collegiate matchmaking explanation ("How UniSport League Eliminates No-Shows").

2. **Venue Marketplace & Dynamic Slot Booking (`src/app/venues/page.tsx` & `src/app/venues/[id]/page.tsx`)**:
   - Multi-parameter filter bar: Sport discipline, price slider ($50 - $180/hr), surface types (Turf, Hardwood, Taraflex), text search query, and Featured-only toggle.
   - **Featured Venues Priority Placement**: Gold glowing badge and elevated card priority for paid venue promotions.
   - Detailed Arena view with dynamic interactive time-slot grid (`SlotGrid`).
   - Slot availability indicators (Open vs. Booked).

3. **Strict 48-Hour Cancellation Policy Enforcement (`src/components/venues/CancellationModal.tsx`)**:
   - Modal trigger upon clicking any open slot.
   - Automatically calculates the exact cancellation deadline: $\text{Deadline} = \text{Slot Start Time} - 48\text{ hours}$.
   - Clear rule display:
     - **> 48 hours before kickoff**: 100% full refund returned to team balance.
     - **$\le$ 48 hours before kickoff**: Full deposit is forfeited and transferred to the Venue Manager as late cancellation compensation.
   - Mandatory policy acknowledgement checkbox before checkout.
   - **Prepayment Options**: Pay 100% full deposit or 50/50 split prepayment between competing university teams.
   - Payment gateway selection interface (Mock Stripe, Credit Card, SBP Fast Pay).

4. **Matchmaking & Challenge Board (`src/app/challenges/page.tsx`)**:
   - "Challenge Feed" displaying open match requests from teams across faculties (e.g., HSE Eagles, Bauman Steamers, MIPT Hawks).
   - "Accept Challenge" workflow with split prepayment confirmation and slot lock.
   - "Post New Challenge" modal allowing captains to pick sport, arena, and available slot.

5. **Inter-University Leaderboards & Team Profiles (`src/app/leaderboards/page.tsx` & `src/app/profile/page.tsx`)**:
   - Official collegiate standings table sorted by total points ($3\text{ pts}$ win, $1\text{ pt}$ draw, $0\text{ pts}$ loss).
   - Spotlight podium cards for #1 Gold, #2 Silver, #3 Bronze ranks.
   - Recent match form pills (`W`, `D`, `L`), win rates, and university faculty tags.
    - `/demo/profile` shows the example team's bookings and standings; `/profile` is a private student account.

6. **Database Schemas & API Endpoints**:
   - `prisma/schema.prisma`: Full relational Prisma schema with enums (`UserRole`, `SportType`, `MatchStatus`, `PaymentStatus`).
   - `supabase/schema.sql`: Supabase PostgreSQL DDL with UUID triggers for automated 48-hour cancellation deadlines.
   - Next.js API Routes:
     - `/api/venues`: GET list & POST new venue registration
     - `/api/slots`: GET & POST slot booking with 48h deadline computation
     - `/api/challenges`: GET open match challenges & POST new challenge
     - `/api/payments/mock`: Mock Stripe checkout session generator

7. **Super Admin Moderation Hub (`src/app/admin/page.tsx`)**:
   - Dedicated administrative control panel for the League Commissioner (`SUPER_ADMIN`).
   - **Dispute Resolution Center**: Review contested match outcomes, review evidence, award victory to either team or declare an official Draw, recalculating points and standings instantly.
   - **Team Moderation**: Fair-play monitoring, sanction tools, and team suspension capabilities.
   - **Venue Approvals**: Fast-track review and priority Featured status granting for partner athletic complexes.

8. **Match Score Submission Workflow (`src/components/challenges/ScoreSubmitModal.tsx`)**:
   - Post-match score entry directly from the Challenge Board for booked fixtures.
   - Dual-captain verification check, live winner indicator, and automatic points awarding into collegiate standings.
   - One-click "Dispute Result" flag trigger for contested games to escalate to Super Admin.

---

## Подключение студенческих аккаунтов

1. Используйте отдельный Supabase-проект UniX. В SQL Editor вручную выполните по порядку
   `supabase/migrations/0001_universities.sql`, `0002_profiles.sql`, `0003_on_signup.sql`.
   Для авторизации **не** запускайте `supabase/schema.sql` или `prisma db push`: это старые схемы демо-домена.
   Триггер требует имя и существующий вуз при каждой новой регистрации. Он не создаёт профили задним числом.
2. В **Authentication → Sign In / Providers** включите Email и подтверждение почты, отключите анонимную регистрацию.
   Установите минимальную длину пароля 12 также в настройках провайдера.
   В **URL Configuration → Site URL** укажите полный адрес `/auth/callback` вашего сайта
   (для локального `next dev`: `http://localhost:3000/auth/callback`, для production — HTTPS).
   Это фиксированный адрес возврата PKCE. Используйте стандартный шаблон письма со ссылкой `{{ .ConfirmationURL }}`.
   В production подключите SMTP для доставки писем студентам.
3. Скопируйте `.env.example` в `.env.local`. В **Connect / Settings → API Keys** возьмите
   Project URL (`NEXT_PUBLIC_SUPABASE_URL`) и **publishable** или legacy **anon** key
   (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). Secret/service-role и пароль PostgreSQL приложению не нужны.
   Перезапустите приложение; для production задайте переменные до сборки и запуска.
4. `/auth/register` создаёт студента; подтверждение откройте в том же браузере.
   `/profile` показывает сохранённые данные; выбранный вуз не подтверждает факт обучения.
   Повышение роли выполняет только уполномоченный администратор БД по проверенному UUID аккаунта
   в `public.profiles`, не через пользовательские метаданные или веб-интерфейс.
   Организатор (`VENUE_MANAGER`) получает `/organizer`; `/admin` доступен только `SUPER_ADMIN`.
   Платежи, бронирования, рейтинги и действия модератора остаются демонстрационными.
5. При приёмке проверьте регистрацию/подтверждение, повторный вход, выход, запрет чтения
   чужого профиля и изменения роли клиентом, прямые переходы на `/admin` и `/organizer`
   для гостя, студента и отдельно назначенных ролей. Не кэшируйте auth-ответы на CDN.

---

## 🏃 Running the Application

In your terminal:

```bash
# Start development server (runs with --webpack on Windows)
npm.cmd run dev

# Or run production build
npm.cmd run build
npm.cmd run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
