# Third-party notices

This repository vendors selected upstream packages so the published core can
be consumed as a self-contained artifact. Upstream code remains under its
original license and copyright.

| Vendored component | Version | License | Upstream |
| --- | ---: | --- | --- |
| `shunshi-bazi-core` | 0.2.0 | MIT | https://github.com/shunshi-ai/bazi-reader-mcp |
| `lunar-javascript` | 1.7.7 | MIT | https://github.com/6tail/lunar-javascript |
| `@openfate/true-solar-time` | 4.0.2 | MIT | https://github.com/openfate-ai/true-solar-time |
| `tyme4ts` | 1.5.2 | MIT | https://github.com/6tail/tyme4ts |

`@openfate/true-solar-time` 4.0.2 declares MIT licensing and OpenFate
Engineering authorship in its published `package.json`, but the npm tarball
does not contain the LICENSE file linked by its README. This repository keeps
a standard MIT notice beside the vendored package using that declared author.

The complete upstream package metadata and available license files are kept
beside each component under `vendor/`. Local integration changes live outside
the vendored directories.

Vendored `package.json` files have development-only scripts and dependencies
removed so workspace installation does not install upstream test toolchains.
Runtime source and package entry points are unchanged.

No GPL-licensed `lunisolar` package or `@lunisolar/plugin-thegods` code is
included in this repository or its npm artifacts.
