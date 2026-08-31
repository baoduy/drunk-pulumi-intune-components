# Library Overview - Drunk Pulumi Intune Components

## Purpose

The `@drunk-pulumi/intune-components` library provides custom Pulumi components for managing Microsoft Intune resources using infrastructure as code. It enables programmatic configuration of device management policies, compliance settings, and corporate device identifiers through the Microsoft Graph API.

## Core Concepts

### Base Components

The library uses a base component architecture with two key abstractions:

1. **BaseComponent**: Abstract foundation class for all Pulumi resource components
   - Extends `pulumi.ComponentResource`
   - Provides `getOutputs()` method for exposing component outputs
   - Uses custom resource type prefix: `drunk:intune:`

2. **BaseProvider**: Base class for dynamic providers that interact with Microsoft Graph API
   - Implements CRUD operations (create, read, update, delete)
   - Handles authentication via Azure service principal
   - Uses Microsoft Graph Beta endpoints

### Authentication

All components authenticate with Microsoft Intune via Azure service principal credentials:
- **Required Environment Variables:**
  - `INTUNE_AZURE_TENANT_ID`: Azure AD tenant ID
  - `INTUNE_AZURE_CLIENT_ID`: Service principal application ID
  - `INTUNE_AZURE_CLIENT_SECRET`: Service principal secret

### Project Structure

```
src/
  IntuneManagement.ts        # Main orchestration component
  DeviceConfiguration.ts     # Device configuration policies
  DeviceCustomConfiguration.ts # Custom configurations
  DeviceCustomConfigurationImporter.ts # Import custom configs from files
  base/                      # Base classes
    BaseComponent.ts
    BaseProvider.ts
  devices/                   # Device-specific components
    MacCompliancePolicy.ts
    ConfigurationPolicy.ts
    ConfigurationPolicyAssignment.ts
    CompliancePolicyAssignment.ts
    CorporateDeviceIdentifiers.ts
    DefaultPlatformRestrictions.ts
    CustomPolicy.ts
    DeviceCatalogs.ts
    helpers/                 # Policy payload generators
      createMacCompliancePayload.ts
      createMacAntivirusPayload.ts
      createMacDiskEncryptionPayload.ts
      createMacFirewallPayload.ts
      createMacCustomConfig.ts
  helpers.ts                 # Graph API utilities
  types.ts                   # Shared TypeScript types
```

## Key Components

### IntuneManagement

Main component for orchestrating Microsoft Intune configurations:
- Manages macOS compliance policies
- Configures device security policies (antivirus, firewall, disk encryption)
- Handles corporate device identifiers
- Manages device catalogs
- Sets default platform restrictions

### Device Components

- **MacCompliancePolicy**: macOS device compliance settings
- **ConfigurationPolicy**: General device configuration policies
- **CustomPolicy**: Custom device configurations
- **CorporateDeviceIdentifiers**: Corporate-owned device registration
- **DeviceCatalogs**: Device catalog management

### Policy Assignments

- **CompliancePolicyAssignment**: Assigns compliance policies to groups
- **ConfigurationPolicyAssignment**: Assigns configuration policies to groups

## Type System

The library uses TypeScript's type system extensively:

- **AsInput<T>**: Converts type to accept Pulumi inputs
- **AsOutput<T>**: Converts type to return Pulumi outputs
- **WithName**: Mixin for optional resource naming
- **WithVaultInfo**: Mixin for Key Vault integration
- **ResourceType**: Standard resource identifier structure

## Microsoft Graph Integration

All components interact with Microsoft Graph API Beta endpoints:
- Base URL: `https://graph.microsoft.com/beta`
- Primary namespace: `deviceManagement`
- Supports full CRUD operations
- Handles error responses and retries

## Development Workflow

1. **Install dependencies**: `pnpm install`
2. **Build library**: `pnpm run build`
3. **Fast build**: `pnpm run fastBuild` (TypeScript only)
4. **Run tests**: `pnpm run test`
5. **Type check**: `npx tsc --noEmit`
6. **Update dependencies**: `pnpm run update`

## Package Information

- **Package Name**: `@drunk-pulumi/intune-components`
- **Version**: 0.0.1
- **Main Entry**: `index.js`
- **Types**: `index.d.ts`
- **Output Directory**: `bin/`
- **License**: MIT

## Dependencies

### Runtime Dependencies
- `@azure/identity`: Azure authentication
- `@microsoft/microsoft-graph-types-beta`: TypeScript types for Graph API
- `@pulumi/pulumi`: Pulumi SDK
- `lodash`: Utility functions

### Development Dependencies
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution
- `cpy-cli`: File copying utility
- `cross-env`: Cross-platform environment variables

## Usage Example

```typescript
import { IntuneManagement } from '@drunk-pulumi/intune-components';

const intune = new IntuneManagement('my-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'macOS Compliance',
      passwordRequired: true,
      assignments: {
        includeAllDevices: true
      }
    },
    antiVirusPolicy: {
      name: 'Antivirus Policy',
      description: 'macOS antivirus configuration',
      assignments: {
        includeAllDevices: true
      }
    }
  }
});
```

## Best Practices

1. Always set required environment variables before deployment
2. Use TypeScript for type safety
3. Test configurations in non-production environment first
4. Review Microsoft Graph API permissions required
5. Follow the established component patterns when extending
6. Document custom configurations with clear descriptions
7. Use assignment options to target specific device groups
