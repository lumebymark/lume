-- 20260501_services_cleanup.sql
--
-- Two cleanups for the public.services table:
--
-- 1. Delete the legacy seeded rows from the old categories that the
--    homepage no longer renders. They were left behind when the seven
--    new categories (settling_in / health / education / lifestyle /
--    environment / leisure / signature) replaced the old set. All
--    target rows are already is_active = false.
--
-- 2. Drop the `subtitle` and `subtitle_i18n` columns. The site never
--    renders a service subtitle anywhere, so the field is just clutter
--    in the admin form.

-- ── 1. Delete legacy services ──────────────────────────────────────────

delete from public.services
where category in (
    'administrative',
    'investment_advisory',
    'healthcare_family',
    'home'
);

-- ── 2. Drop subtitle columns ───────────────────────────────────────────

alter table public.services drop column if exists subtitle;
alter table public.services drop column if exists subtitle_i18n;
