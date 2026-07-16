# Architecture

```text
MCP client -> xuantian-bazi-mcp -> xuantian-bazi -> bundled MIT engines
Application ---------------------> xuantian-bazi
```

`packages/core` owns validation, time correction, chart calculation,
normalization, localization and compatibility behavior. It is built as dual
ESM/CommonJS output. Selected upstream packages under `vendor/` are build-time
inputs and are included in the core bundle, not declared as consumer runtime
dependencies.

`packages/mcp` only maps MCP schemas to the typed core API. It is stateless,
uses stdio transport and emits structured tool content. It must not implement
calculation rules of its own.

The original `code/message/data` API remains an adapter over the same pipeline.
New behavior belongs in the typed API first and requires compatibility tests
before changing the adapter.
