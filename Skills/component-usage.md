# Component Usage - Drunk Pulumi Intune Components

## Using IntuneManagement Component

The `IntuneManagement` component is the main orchestrator for Microsoft Intune configurations.

### Basic Setup

```typescript
import { IntuneManagement } from '@drunk-pulumi/intune-components';

const intune = new IntuneManagement('my-intune-config', {
  intuneId: 'your-intune-id', // Optional: found when updating DefaultPlatformRestrictions
  corporateDeviceIdentifiers: [
    { identifier: 'XX:XX:XX:XX:XX:XX', description: 'Corporate MacBook' }
  ],
  deviceCatalogs: ['catalog-id-1', 'catalog-id-2']
});
```

### Configuration Structure

The `IntuneManagementArgs` interface accepts:

- **intuneId**: (Optional) String - Intune instance identifier
- **corporateDeviceIdentifiers**: Array - Corporate device MAC addresses or serial numbers
- **deviceCatalogs**: Array - Device catalog IDs to enable
- **macOs**: Object - macOS-specific configurations (see below)

## macOS Configuration

### Compliance Policy

Define compliance requirements for macOS devices:

```typescript
const intune = new IntuneManagement('intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Corporate macOS Compliance',
      description: 'Compliance policy for corporate macOS devices',
      passwordRequired: true,
      passwordMinimumLength: 12,
      passwordRequiredType: 'alphanumeric',
      osMinimumVersion: '13.0',
      osMaximumVersion: '14.0',
      systemIntegrityProtectionEnabled: true,
      firewallEnabled: true,
      storageRequireEncryption: true,
      assignments: {
        includeAllDevices: false,
        includeGroups: ['group-id-1', 'group-id-2'],
        excludeGroups: ['guest-group-id']
      }
    }
  }
});
```

### Antivirus Policy

Configure Microsoft Defender or other antivirus solutions:

```typescript
const intune = new IntuneManagement('intune', {
  macOs: {
    antiVirusPolicy: {
      name: 'Corporate Antivirus',
      description: 'Microsoft Defender settings for macOS',
      platforms: 'macOS',
      templateReference: {
        templateId: 'antivirus-template-id'
      },
      settings: [
        {
          settingInstance: {
            '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
            settingDefinitionId: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection',
            choiceSettingValue: {
              value: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection_true'
            }
          }
        }
      ],
      assignments: {
        includeAllDevices: true
      }
    }
  }
});
```

### Disk Encryption Policy

Enable FileVault disk encryption:

```typescript
const intune = new IntuneManagement('intune', {
  macOs: {
    diskEncryptionPolicy: {
      enabled: true,
      allowDeferralUntilSignOut: true,
      numberOfTimesUserCanIgnore: 3,
      personalRecoveryKeyRotationInMonths: 6,
      assignments: {
        includeAllDevices: true
      }
    }
  }
});
```

### Firewall Policy

Configure macOS firewall settings:

```typescript
const intune = new IntuneManagement('intune', {
  macOs: {
    firewallPolicy: {
      enabled: true,
      blockAllIncoming: false,
      enableStealthMode: true,
      allowSignedApps: true,
      allowDownloadSignedApps: true,
      assignments: {
        includeAllDevices: true,
        excludeGroups: ['developers-group']
      }
    }
  }
});
```

## Custom Configurations

### Import Custom Configuration Files

Import custom configuration files for device management:

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const intune = new IntuneManagement('intune', {
  macOs: {
    importCustomConfigs: [
      {
        name: 'Custom WiFi Profile',
        description: 'Corporate WiFi configuration',
        filePath: './configs/wifi-profile.mobileconfig',
        assignments: {
          includeGroups: ['all-users-group']
        }
      }
    ]
  }
});
```

### Import Custom Configuration Folders

Import multiple configurations from a directory:

```typescript
const intune = new IntuneManagement('intune', {
  macOs: {
    importCustomConfigsFolders: [
      {
        folderPath: './configs/macos',
        filePattern: '*.mobileconfig',
        assignments: {
          includeAllDevices: true
        }
      }
    ]
  }
});
```

## Policy Assignments

All policies support flexible assignment options:

### Assignment Types

```typescript
// Include all devices
assignments: {
  includeAllDevices: true
}

// Include specific groups
assignments: {
  includeGroups: ['group-id-1', 'group-id-2']
}

// Exclude specific groups
assignments: {
  includeAllDevices: true,
  excludeGroups: ['guest-devices']
}

// Complex assignment
assignments: {
  includeGroups: ['corporate-devices'],
  excludeGroups: ['contractor-devices'],
  includeAllDevices: false
}
```

## Using Individual Components

### Direct Component Usage

You can also use individual components directly:

```typescript
import { 
  MacCompliancePolicyResource,
  ConfigurationPolicyResource,
  CompliancePolicyAssignmentResource
} from '@drunk-pulumi/intune-components';

// Create compliance policy
const compliancePolicy = new MacCompliancePolicyResource('mac-compliance', {
  displayName: 'macOS Compliance',
  passwordRequired: true,
  osMinimumVersion: '13.0'
});

// Assign policy to groups
const assignment = new CompliancePolicyAssignmentResource('compliance-assignment', {
  compliancePolicyId: compliancePolicy.id,
  includeGroups: ['group-id']
});
```

## Device Configuration Components

### ConfigurationPolicy

For general device configurations:

```typescript
import { ConfigurationPolicyResource } from '@drunk-pulumi/intune-components';

const config = new ConfigurationPolicyResource('device-config', {
  name: 'General Device Configuration',
  description: 'Standard device settings',
  platforms: 'macOS',
  technologies: 'mdm',
  settings: [/* configuration settings */]
});
```

### CustomPolicy

For custom device policies:

```typescript
import { CustomPolicyResource } from '@drunk-pulumi/intune-components';

const customPolicy = new CustomPolicyResource('custom-policy', {
  name: 'Custom Configuration',
  description: 'Custom device settings',
  payload: {/* custom payload */}
});
```

## Corporate Device Identifiers

Register corporate-owned devices:

```typescript
import { CorporateDeviceIdentifiersResource } from '@drunk-pulumi/intune-components';

const corporateDevices = new CorporateDeviceIdentifiersResource('corporate-devices', {
  corporateDeviceIdentifiers: [
    {
      identifier: 'XX:XX:XX:XX:XX:XX',
      description: 'MacBook Pro - John Doe',
      enrollmentType: 'device'
    },
    {
      identifier: 'SERIAL123456',
      description: 'iMac - Conference Room',
      enrollmentType: 'device'
    }
  ]
});
```

## Device Catalogs

Manage device catalogs for app and update deployments:

```typescript
import { DeviceCatalogResource } from '@drunk-pulumi/intune-components';

const catalog = new DeviceCatalogResource('app-catalog', {
  catalogIds: ['catalog-id-1', 'catalog-id-2']
});
```

## Default Platform Restrictions

Configure default enrollment restrictions:

```typescript
import { DefaultPlatformRestrictionsResource } from '@drunk-pulumi/intune-components';

const restrictions = new DefaultPlatformRestrictionsResource('platform-restrictions', {
  intuneId: 'intune-instance-id',
  platformRestrictions: {
    macOS: {
      platformBlocked: false,
      personalDeviceEnrollmentBlocked: true
    }
  }
});
```

## Output Handling

All components provide outputs via the `getOutputs()` method:

```typescript
const intune = new IntuneManagement('intune', {/* config */});

// Access outputs
const outputs = intune.getOutputs();

// Export specific outputs
export const compliancePolicyId = intune.getOutputs().compliancePolicyId;
```

## Best Practices

1. **Group Related Policies**: Use IntuneManagement component for related configurations
2. **Use Descriptive Names**: Provide clear displayName and description values
3. **Test Assignments**: Start with small groups before deploying to all devices
4. **Version Control Configs**: Store custom configuration files in version control
5. **Document Custom Settings**: Add comments explaining custom configuration choices
6. **Use Type Safety**: Leverage TypeScript types for compile-time validation
7. **Handle Outputs**: Export important resource IDs for reference by other stacks
