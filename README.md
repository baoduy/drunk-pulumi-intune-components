# drunk-pulumi-intune-components

The Microsoft Intune Pulumi Components, including importing a Microsoft Intune Organization.

## Authentication

Graph API calls support two credential shapes:

- **Explicit client secret** — set all three `INTUNE_AZURE_TENANT_ID`, `INTUNE_AZURE_CLIENT_ID` and
  `INTUNE_AZURE_CLIENT_SECRET` together, and all three must be non-empty.
- **Identity-based (preferred)** — set none of the `INTUNE_AZURE_*` vars and let `DefaultAzureCredential`
  resolve the identity, including via OIDC federation (GitHub Actions / Azure Pipelines) or managed
  identity in CI, so the stack needs no long-lived application secret.

**Upgrade note:** credential selection now requires all three `INTUNE_AZURE_*` variables together — a mixed
combination (e.g. `INTUNE_AZURE_TENANT_ID` alongside an unprefixed `AZURE_CLIENT_SECRET`) now resolves
through `DefaultAzureCredential` instead. A consumer relying on that mix will stop authenticating on
upgrade and must move fully to one shape or the other.
