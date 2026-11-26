# Migrate legacy SHA-1 passwords

With `DEPRECATED_USE_SHA1_PASSWORDS=false`, SlenderAAC stores new and changed
passwords with bcrypt and issues opaque sessions for game login.
`ALLOW_LEGACY_SHA1_PASSWORDS=true` also accepts existing SHA-1 passwords.
Keep `DEPRECATED_USE_SHA1_PASSWORDS=true` on game backends that still require the
legacy credential-based login and SHA-1 password writes. Upgrade the game backend
before switching those installations to opaque sessions.

## Enable migration

1. In a test environment, confirm the installed game backend accepts opaque
   sessions and a bcrypt account can sign in on the website and enter the game.
   Check any other service that reads or writes the shared account passwords.
2. Back up the account database and verify the release available for rollback
   also accepts bcrypt and supports opaque sessions with the installed backend.
   A release that only accepts SHA-1 cannot authenticate converted accounts.
3. Keep `DEPRECATED_USE_SHA1_PASSWORDS=false` and
   `ALLOW_LEGACY_SHA1_PASSWORDS=true`. Set `UPGRADE_LEGACY_SHA1_PASSWORDS=true`
   in the application's runtime environment and restart it. If you change one
   of the two existing flags, rebuild the application because those flags are
   evaluated at build time.

When enabled, SlenderAAC upgrades an account on a successful web or game login
after the applicable email and two-factor checks and after creating the session.
The update uses the previously verified hash as a condition, so a concurrent
password reset wins. A failed upgrade leaves the login intact and can be retried
on the next login. To pause the upgrade, set
`UPGRADE_LEGACY_SHA1_PASSWORDS=false` and restart the application.

Passwords longer than 72 UTF-8 bytes keep their existing SHA-1 hash until the
owner resets the password. Choose a replacement no longer than 72 bytes to stay
within bcrypt's input limit.

## Retire SHA-1 verification

Track the aggregate number of accounts whose password matches the legacy
40-character hex format.

```sql
SELECT COUNT(*) AS legacy_accounts
FROM accounts
WHERE password REGEXP '^[0-9A-Fa-f]{40}$';
```

After active accounts have converted, give remaining account owners a way to
reset their passwords. Disable `ALLOW_LEGACY_SHA1_PASSWORDS` and rebuild once the
remaining accounts have a working recovery path. Verify both web and game login
with converted accounts.
