-- BookStack: per-user book shelf, synced from the app's local SQLite database.
--
-- Sync model
--   * Clients upsert rows with their own `updated_at`. A trigger keeps whichever version is
--     newer (last write wins), so an offline device can never overwrite a newer edit.
--   * The server stamps `server_updated_at` on every accepted write. Clients pull changes
--     with `pull_books`, paging by (server_updated_at, id).
--   * Deletes are soft (`deleted_at`) so they reach other devices.

create table public.books (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  title text not null,
  author text not null default '',
  cover_url text,
  page_count integer check (page_count is null or page_count >= 0),
  pages_read integer not null default 0 check (pages_read >= 0),
  status text not null default 'reading' check (status in ('reading', 'finished')),
  open_library_key text,
  isbn text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  server_updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index books_user_changes_idx on public.books (user_id, server_updated_at, id);

-- Last write wins: skip updates older than what the server already has.
create function public.books_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.updated_at < old.updated_at then
    return null; -- keep the newer row; the client will pull it
  end if;
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

create trigger books_before_write
before insert or update on public.books
for each row execute function public.books_before_write();

-- Row level security: each user sees and writes only their own books.
alter table public.books enable row level security;

create policy "Users read their own books"
on public.books for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users add their own books"
on public.books for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update their own books"
on public.books for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- No delete policy: the app soft-deletes. Rows go away when the account is deleted.

grant select, insert, update on public.books to authenticated;

-- Changes since a cursor, in a stable order, for paging.
create function public.pull_books(
  since timestamptz default '-infinity',
  after_id text default '',
  page_size integer default 500
)
returns setof public.books
language sql
stable
security invoker
set search_path = ''
as $$
  select *
  from public.books
  where user_id = (select auth.uid())
    and (server_updated_at, id) > (since, after_id)
  order by server_updated_at, id
  limit least(greatest(page_size, 1), 1000);
$$;

revoke execute on function public.pull_books(timestamptz, text, integer) from public, anon;
grant execute on function public.pull_books(timestamptz, text, integer) to authenticated;
