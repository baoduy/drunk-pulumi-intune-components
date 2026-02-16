# Best Practices - Drunk Pulumi Intune Components

## General Principles

### 1. Infrastructure as Code Philosophy

- **Version Control**: Store all Pulumi configurations in Git
- **Code Review**: Review infrastructure changes like application code
- **Testing**: Test configurations in non-production environments first
- **Documentation**: Document non-obvious configuration choices
- **Modularity**: Create reusable components for common patterns

### 2. Type Safety

Always leverage TypeScript's type system:

```typescript
// ✅ Good: Type-safe configuration
import { IntuneManagement, MacCompliancePolicyInputs } from '@drunk-pulumi/intune-components';

const complianceConfig: MacCompliancePolicyInputs = {
  displayName: 'Corporate Compliance',
  passwordRequired: true,
  // TypeScript ensures all required fields are present
};

// ❌ Bad: Untyped configuration
const complianceConfig = {
  displayNam: 'Corporate Compliance',  // Typo won't be caught
  passwordReqired: true
};
```

### 3. Error Handling

Handle Pulumi outputs and potential errors gracefully:

```typescript
// ✅ Good: Proper output handling
const intune = new IntuneManagement('intune', config);
const policyId = intune.getOutputs().compliancePolicyId;

policyId.apply(id => {
  if (!id) {
    throw new Error('Compliance policy ID is required');
  }
  // Use id safely
});

// ❌ Bad: Assuming outputs are always present
const policyId = intune.getOutputs().compliancePolicyId;
console.log(policyId.id);  // May be undefined
```

## Authentication & Security

### Environment Variables

Never hardcode credentials:

```typescript
// ✅ Good: Use environment variables
const tenantId = process.env.INTUNE_AZURE_TENANT_ID;
const clientId = process.env.INTUNE_AZURE_CLIENT_ID;
const clientSecret = process.env.INTUNE_AZURE_CLIENT_SECRET;

if (!tenantId || !clientId || !clientSecret) {
  throw new Error('Azure credentials not configured');
}

// ❌ Bad: Hardcoded credentials
const tenantId = 'abc-123-def';  // Never do this!
const clientSecret = 'my-secret';
```

### Secure Credential Management

```bash
# Use .env file (git-ignored)
echo "INTUNE_AZURE_TENANT_ID=your-tenant-id" >> .env
echo "INTUNE_AZURE_CLIENT_ID=your-client-id" >> .env
echo "INTUNE_AZURE_CLIENT_SECRET=your-secret" >> .env

# Or use Pulumi config secrets
pulumi config set --secret azureTenantId your-tenant-id
pulumi config set --secret azureClientId your-client-id
pulumi config set --secret azureClientSecret your-secret
```

### Service Principal Permissions

Ensure your service principal has appropriate Microsoft Graph API permissions:

**Required Permissions**:
- `DeviceManagementConfiguration.ReadWrite.All`
- `DeviceManagementManagedDevices.ReadWrite.All`
- `DeviceManagementServiceConfig.ReadWrite.All`
- `Group.Read.All` (for assignments)

## Resource Organization

### Stack Organization

```typescript
// ✅ Good: Organized by environment
// stacks/production.ts
import { IntuneManagement } from '@drunk-pulumi/intune-components';

const prodIntune = new IntuneManagement('prod-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Production - macOS Compliance',
      // Strict settings for production
    }
  }
});

// stacks/development.ts
const devIntune = new IntuneManagement('dev-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Development - macOS Compliance',
      // Relaxed settings for development
    }
  }
});
```

### Configuration Management

```typescript
// ✅ Good: Separate configuration from code
// config/compliance-policies.ts
export const compliancePolicies = {
  production: {
    passwordMinimumLength: 14,
    passwordExpirationDays: 90,
    osMinimumVersion: '13.0'
  },
  development: {
    passwordMinimumLength: 8,
    passwordExpirationDays: 365,
    osMinimumVersion: '12.0'
  }
};

// index.ts
import { compliancePolicies } from './config/compliance-policies';
const config = pulumi.getStack();
const policyConfig = compliancePolicies[config];
```

## Naming Conventions

### Resource Names

```typescript
// ✅ Good: Descriptive, consistent names
const corpMacCompliance = new IntuneManagement('corp-mac-compliance', {
  macOs: {
    compliancePolicy: {
      displayName: 'Corporate macOS Compliance Policy',
      description: 'Baseline compliance for all corporate MacBooks'
    }
  }
});

// ❌ Bad: Vague, inconsistent names
const policy = new IntuneManagement('pol1', {
  macOs: {
    compliancePolicy: {
      displayName: 'policy'
    }
  }
});
```

### Naming Patterns

- **Resource IDs**: Use kebab-case: `corp-mac-compliance`
- **Display Names**: Use proper casing: `Corporate macOS Compliance Policy`
- **Descriptions**: Be specific and helpful
- **File Names**: Use kebab-case: `compliance-policies.ts`

## Policy Configuration

### Start with Baseline

```typescript
// ✅ Good: Start with secure baseline
const baselineCompliance = {
  passwordRequired: true,
  passwordMinimumLength: 12,
  storageRequireEncryption: true,
  firewallEnabled: true,
  systemIntegrityProtectionEnabled: true
};

// Extend for specific needs
const productionCompliance = {
  ...baselineCompliance,
  passwordMinimumLength: 14,
  deviceThreatProtectionEnabled: true
};
```

### Incremental Rollout

```typescript
// ✅ Good: Progressive rollout strategy
const phaseOneGroups = ['pilot-users'];
const phaseTwoGroups = ['department-a', 'department-b'];
const phaseThreeGroups = ['all-users'];

// Phase 1: Pilot
const pilotPolicy = new IntuneManagement('pilot', {
  macOs: {
    compliancePolicy: {
      displayName: 'Pilot - New Compliance',
      assignments: { includeGroups: phaseOneGroups }
    }
  }
});

// After validation, expand to phase 2, then 3
```

### Version Descriptions

```typescript
// ✅ Good: Include version information
{
  displayName: 'Corporate macOS Compliance',
  description: 'v2.0 - Updated 2024-02-15: Added FileVault requirement'
}

// Track changes in comments
/*
 * Compliance Policy Changes:
 * v2.0 (2024-02-15): Added FileVault requirement
 * v1.1 (2024-01-10): Increased password length to 12
 * v1.0 (2023-12-01): Initial release
 */
```

## Assignment Best Practices

### Target Appropriately

```typescript
// ✅ Good: Targeted assignments
{
  assignments: {
    includeGroups: ['corporate-macbooks'],
    excludeGroups: ['legacy-devices', 'test-devices']
  }
}

// ❌ Bad: Too broad without exclusions
{
  assignments: {
    includeAllDevices: true  // Includes test devices!
  }
}
```

### Test Group Strategy

```typescript
// ✅ Good: Always have test group
const testGroupId = 'test-devices-group';

const newPolicy = new IntuneManagement('new-policy', {
  macOs: {
    compliancePolicy: {
      displayName: 'New Policy - Testing',
      assignments: {
        includeGroups: [testGroupId]
      }
    }
  }
});

// After validation, expand to production
```

## Custom Configurations

### File Organization

```
project/
├── configs/
│   ├── macos/
│   │   ├── wifi-corporate.mobileconfig
│   │   ├── vpn-config.mobileconfig
│   │   └── certificates/
│   │       └── root-ca.mobileconfig
│   └── ios/
│       └── ...
└── index.ts
```

### Configuration Validation

```typescript
// ✅ Good: Validate files exist
import * as fs from 'fs';
import * as path from 'path';

function validateConfigFile(filePath: string): void {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Configuration file not found: ${fullPath}`);
  }
  
  // Validate it's a .mobileconfig file
  if (!fullPath.endsWith('.mobileconfig')) {
    throw new Error(`Invalid file type: ${fullPath}. Expected .mobileconfig`);
  }
}

validateConfigFile('./configs/wifi.mobileconfig');
```

## Testing & Validation

### Pre-Deployment Testing

```typescript
// Run before deploying
// 1. Type check
// npx tsc --noEmit

// 2. Build
// pnpm run build

// 3. Preview changes
// pulumi preview

// ✅ Good: Validate in CI/CD
// .github/workflows/validate.yml
// - name: Type Check
//   run: npx tsc --noEmit
// - name: Build
//   run: pnpm run build
```

### Policy Testing Workflow

1. **Create in test environment**
2. **Assign to test group**
3. **Validate on test devices** (at least 3 devices)
4. **Monitor for 24-48 hours**
5. **Review compliance reports**
6. **Expand to pilot group**
7. **Deploy to production**

## Monitoring & Maintenance

### Output Management

```typescript
// ✅ Good: Export useful outputs
export const outputs = {
  compliancePolicyId: intune.getOutputs().compliancePolicyId,
  compliancePolicyName: 'Corporate macOS Compliance',
  lastUpdated: new Date().toISOString(),
  environment: pulumi.getStack()
};
```

### Regular Reviews

**Monthly**:
- Review compliance reports
- Check for policy conflicts
- Update OS version requirements
- Review assignment groups

**Quarterly**:
- Update password expiration policies
- Review security baselines
- Audit custom configurations
- Update documentation

**Annually**:
- Comprehensive security review
- Update all policies to latest best practices
- Review and update service principal permissions

## Performance Optimization

### Minimize API Calls

```typescript
// ✅ Good: Batch operations
const intune = new IntuneManagement('intune', {
  macOs: {
    compliancePolicy: { /* settings */ },
    antiVirusPolicy: { /* settings */ },
    diskEncryptionPolicy: { /* settings */ }
    // All created in one component
  }
});

// ❌ Bad: Multiple separate components
const compliance = new MacCompliancePolicy(/* */);
const antivirus = new ConfigurationPolicy(/* */);
const encryption = new ConfigurationPolicy(/* */);
// Creates multiple API calls
```

### Dependency Management

```typescript
// ✅ Good: Explicit dependencies
const policy = new ConfigurationPolicy('policy', config);
const assignment = new ConfigurationPolicyAssignment('assignment', {
  configPolicyId: policy.id,
  // ...
}, { dependsOn: [policy] });

// Ensures proper creation order
```

## Documentation

### Code Comments

```typescript
// ✅ Good: Explain non-obvious choices
const intune = new IntuneManagement('intune', {
  macOs: {
    compliancePolicy: {
      // Allow 3 deferrals to accommodate users traveling without laptop charger
      diskEncryptionPolicy: {
        numberOfTimesUserCanIgnore: 3
      },
      
      // Exclude legacy hardware that doesn't support FileVault 2
      assignments: {
        includeAllDevices: true,
        excludeGroups: ['pre-2015-macs']
      }
    }
  }
});
```

### README Documentation

Include in your project README:
- Required environment variables
- Azure service principal setup instructions
- Group IDs and their purposes
- Deployment process
- Rollback procedures

## Common Pitfalls to Avoid

### 1. Hardcoding Group IDs

```typescript
// ❌ Bad
assignments: { includeGroups: ['abc-123-def'] }

// ✅ Good
const groupIds = {
  allUsers: pulumi.config.require('allUsersGroupId'),
  testUsers: pulumi.config.require('testUsersGroupId')
};
assignments: { includeGroups: [groupIds.allUsers] }
```

### 2. Ignoring Pulumi Outputs

```typescript
// ❌ Bad: Treating outputs as regular values
const id = policy.id;
console.log(id.length);  // Error: Output is not a string

// ✅ Good: Use apply for outputs
policy.id.apply(id => {
  console.log(`Policy ID: ${id}`);
});
```

### 3. Over-Restrictive Policies

```typescript
// ❌ Bad: Too restrictive for all users
{
  passwordMinimumLength: 20,
  passwordExpirationDays: 30,
  blockAllIncoming: true  // Breaks most apps
}

// ✅ Good: Balanced security
{
  passwordMinimumLength: 12,
  passwordExpirationDays: 90,
  blockAllIncoming: false
}
```

### 4. Missing Error Handling

```typescript
// ✅ Good: Handle errors
try {
  const intune = new IntuneManagement('intune', config);
} catch (error) {
  console.error('Failed to create Intune management:', error);
  throw error;
}
```

### 5. Not Using Stack Configuration

```typescript
// ✅ Good: Use stack-specific config
const config = new pulumi.Config();
const environment = pulumi.getStack();
const policyName = config.require('policyName');

// Different settings per stack
const compliance = environment === 'production' 
  ? productionComplianceConfig
  : developmentComplianceConfig;
```

## Security Checklist

- [ ] No hardcoded credentials
- [ ] Environment variables properly secured
- [ ] Service principal has minimal required permissions
- [ ] Test devices excluded from production policies
- [ ] Password policies enforce strong passwords
- [ ] Disk encryption required
- [ ] Firewall enabled
- [ ] System Integrity Protection required
- [ ] Antivirus deployed
- [ ] Regular compliance monitoring configured

## Deployment Checklist

- [ ] Code reviewed and approved
- [ ] TypeScript type checking passes
- [ ] Build succeeds without errors
- [ ] Tested in development environment
- [ ] Pulumi preview reviewed
- [ ] Assignment groups verified
- [ ] Exclusion groups configured
- [ ] Documentation updated
- [ ] Rollback plan prepared
- [ ] Monitoring configured
