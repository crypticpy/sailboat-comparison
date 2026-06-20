-- Defense-in-depth: make public.boats read-only at the privilege level, not just
-- via RLS. Supabase's default privileges grant the full DML set (INSERT/UPDATE/
-- DELETE/TRUNCATE/...) to anon and authenticated on every new public table; RLS
-- already blocks those writes (there is no INSERT/UPDATE/DELETE policy, so they
-- affect zero rows), but we don't want RLS to be the *only* boundary. Revoke the
-- write privileges so the grant level matches the intended posture: read-only
-- for both roles. SELECT remains (granted in the initial migration).
--
-- When an authenticated admin write path is added later, grant the specific
-- privileges back to `authenticated` alongside an ownership-scoped policy.

revoke insert, update, delete, truncate, references, trigger
  on public.boats from anon;

revoke insert, update, delete, truncate, references, trigger
  on public.boats from authenticated;
