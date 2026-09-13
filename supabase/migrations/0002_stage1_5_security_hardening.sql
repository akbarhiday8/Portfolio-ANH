-- Mirrors Stage 1.5 hardening already applied to the remote Supabase project.
-- Keep this migration after 0001 when initializing a fresh project.

revoke execute on function public.cms_is_admin() from anon;

-- rls_auto_enable exists on the hardened remote project, but is not created by
-- 0001. Keep fresh-project initialization safe when that helper is absent.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public';
  end if;
end;
$$;
