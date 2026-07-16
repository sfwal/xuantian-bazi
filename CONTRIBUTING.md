# Contributing

Requires Node.js 20 or newer and npm 10 or newer.

```bash
npm install
npm run check
```

Changes to calculation rules must include a regression fixture. Changes under
`vendor/` must also update `THIRD_PARTY_NOTICES.md` with the upstream version,
commit or release, and a short description of local changes.

Do not add GPL-licensed runtime code without first changing the repository and
package licensing strategy through a documented project decision.
