# drunk-pulumi-intune-components

The Microsoft Intune Pulumi Components - A TypeScript library for managing Microsoft Intune resources with Pulumi.

## Overview

This library provides custom Pulumi components for managing Microsoft Intune resources using infrastructure as code. It enables programmatic configuration of device management policies, compliance settings, and corporate device identifiers through the Microsoft Graph API.

## Features

- **IntuneManagement Component**: Orchestrate macOS device policies, compliance, and security settings
- **Device Policies**: Configure compliance policies, antivirus, disk encryption, and firewall settings
- **Custom Configurations**: Import and deploy custom .mobileconfig profiles
- **Policy Assignments**: Flexible group-based policy targeting
- **TypeScript Support**: Full type safety with TypeScript definitions
- **Base Components**: Reusable abstractions for building custom Intune resources

## Installation

```bash
npm install @drunk-pulumi/intune-components
# or
pnpm add @drunk-pulumi/intune-components
```

## Quick Start

```typescript
import { IntuneManagement } from '@drunk-pulumi/intune-components';

const intune = new IntuneManagement('corporate-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Corporate macOS Compliance',
      passwordRequired: true,
      passwordMinimumLength: 12,
      storageRequireEncryption: true,
      assignments: {
        includeAllDevices: true
      }
    }
  }
});

export const outputs = intune.getOutputs();
```

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

## Documentation

### GitHub Copilot Skills

This repository includes comprehensive GitHub Copilot skills in the [`Skills/`](./Skills) folder to help you work effectively with the library:

- **[Library Overview](./Skills/library-overview.md)** - Architecture, base components, and project structure
- **[Component Usage](./Skills/component-usage.md)** - How to use IntuneManagement and individual components
- **[Development Workflow](./Skills/development-workflow.md)** - Building, testing, and publishing the library
- **[Intune Management](./Skills/intune-management.md)** - Detailed IntuneManagement component reference
- **[Device Policies](./Skills/device-policies.md)** - Comprehensive policy configuration guide
- **[Best Practices](./Skills/best-practices.md)** - Security, testing, and deployment best practices
- **[Troubleshooting](./Skills/troubleshooting.md)** - Common issues and debugging tips

These skills are designed to work with GitHub Copilot to provide context-aware assistance when developing with this library.

## Development

### Prerequisites

- Node.js 16+ (tested with Node.js 20)
- pnpm or npm
- TypeScript

### Setup

```bash
# Install dependencies
pnpm install

# Build the library
pnpm run build

# Run tests
pnpm run test

# Type check
npx tsc --noEmit
```

### Project Structure

```
src/
  IntuneManagement.ts        # Main orchestration component
  base/                      # Base classes
  devices/                   # Device-specific components
  helpers.ts                 # Graph API utilities
  types.ts                   # Shared TypeScript types
```

## Examples

See the [`pulumi-test/`](./pulumi-test) directory for working examples.

## Contributing

Contributions are welcome! Please read the Skills documentation to understand the project structure and best practices.

## License

MIT

## Author

Steven Hoang
