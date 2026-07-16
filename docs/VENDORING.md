# Vendoring policy

Vendored code must use a license compatible with this MIT distribution. Each
component keeps its upstream package metadata, README, available license file,
and compiled/source files as shipped by npm.

To update a component:

1. Review the upstream repository, changelog, license and transitive runtime dependencies.
2. Replace only that component directory with the exact npm release contents.
3. Remove development-only scripts and dependencies from its vendored `package.json`; do not modify runtime entry points.
4. Update `THIRD_PARTY_NOTICES.md` and regenerate `package-lock.json`.
5. Run `npm run check`, compare golden fixtures, inspect `npm pack --dry-run`, and run `npm audit --omit=dev`.

Do not copy isolated functions into `packages/core`. Integration changes belong
there, while upstream code remains attributable and replaceable under
`vendor/`.
