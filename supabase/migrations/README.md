# Database migrations

These files are applied by hand in the Supabase SQL Editor, because there is no migration runner.
Apply them in filename order. Only the first forms migration is unsafe to re-run.

## Forms module
1. `202610091000_create_forms_module.sql` - tables, rules and Row Level Security (not safe to re-run)
2. `202610121000_forms_audit_logging.sql` - audit log triggers (safe to re-run)
3. `202610131000_forms_respondent_support.sql` - opened and submitted status sync (safe to re-run)

Already applied on `pnc-elc-dev`.
