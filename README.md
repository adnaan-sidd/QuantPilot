# QuantPilot AI

## Environment Variables

To run this application, you need to configure the following environment variables (or add them to your `.env` file):

### 1. Supabase (Authentication & Database)
Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Select Project -> **Project Settings** -> **API**.

*   `SUPABASE_URL`: The URL of your project (e.g., `https://xyz.supabase.co`)
*   `SUPABASE_ANON_KEY`: The `anon` `public` key.

### 2. Google Gemini (AI Logic)
Go to [Google AI Studio](https://aistudio.google.com/) -> **Get API key**.

*   `API_KEY`: Your Gemini API Key.

---

## Supabase Setup

1.  **Enable Auth**: Go to Authentication -> Providers -> Enable **Email/Password**.
2.  **Disable Email Confirm (Optional)**: For development, you can disable "Confirm email" in Authentication -> Providers -> Email to allow users to log in immediately after signup.

## Database Schema (SQL)

Run the following SQL in your Supabase **SQL Editor** to create the tables required for the full application structure:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (extends default auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  plan text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, plan)
  values (new.id, new.raw_user_meta_data->>'full_name', 'free');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. STRATEGIES
create table public.strategies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  asset text,
  timeframe text,
  parsed_config jsonb,
  status text default 'draft', -- 'draft', 'active', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BACKTESTS
create table public.backtests (
  id uuid default uuid_generate_v4() primary key,
  strategy_id uuid references public.strategies(id) not null,
  user_id uuid references public.profiles(id) not null,
  stats jsonb, -- { totalReturn, winRate, etc }
  equity_curve jsonb, -- Array of points
  trades jsonb, -- Array of trades
  status text default 'pending', -- 'pending', 'completed', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table strategies enable row level security;
alter table backtests enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own strategies" on strategies for select using (auth.uid() = user_id);
create policy "Users can insert own strategies" on strategies for insert with check (auth.uid() = user_id);
create policy "Users can update own strategies" on strategies for update using (auth.uid() = user_id);

create policy "Users can view own backtests" on backtests for select using (auth.uid() = user_id);
create policy "Users can insert own backtests" on backtests for insert with check (auth.uid() = user_id);
```