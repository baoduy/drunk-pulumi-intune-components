# Intune Management - Drunk Pulumi Intune Components

## Overview

The `IntuneManagement` component is the primary orchestrator for managing Microsoft Intune configurations through Pulumi. It provides a unified interface for managing macOS device policies, compliance settings, and device identifiers.

## Component Architecture

```typescript
import { IntuneManagement } from '@drunk-pulumi/intune-components';

// Basic structure
const intune = new IntuneManagement(name, args, opts);
```

**Parameters**:
- `name` (string): Unique identifier for this component instance
- `args` (IntuneManagementArgs): Configuration arguments
- `opts` (pulumi.ComponentResourceOptions): Optional Pulumi resource options

## IntuneManagementArgs Interface

```typescript
interface IntuneManagementArgs {
  intuneId?: pulumi.Input<string>;
  corporateDeviceIdentifiers?: CorporateDeviceIdentifierArgs[];
  deviceCatalogs?: string[];
  macOs?: {
    compliancePolicy: MacCompliancePolicyType;
    antiVirusPolicy?: ConfigurationPolicyType;
    diskEncryptionPolicy?: MacDiskEncryptionPayloadArgs & AssignmentType;
    firewallPolicy?: MacFirewallConfigurationArgs & AssignmentType;
    importCustomConfigs?: Array<CustomConfigArgs & AssignmentType>;
    importCustomConfigsFolders?: Array<DirectoryMacConfigsImporterArgs & AssignmentType>;
  };
}
```

## Complete Configuration Example

```typescript
import { IntuneManagement } from '@drunk-pulumi/intune-components';
import * as pulumi from '@pulumi/pulumi';

const intune = new IntuneManagement('corporate-intune', {
  // Intune instance ID (optional, discovered when creating DefaultPlatformRestrictions)
  intuneId: pulumi.output('your-intune-id'),
  
  // Register corporate-owned devices
  corporateDeviceIdentifiers: [
    {
      identifier: 'AA:BB:CC:DD:EE:FF',
      description: 'MacBook Pro - Engineering',
      enrollmentType: 'device'
    },
    {
      identifier: 'SERIAL123456789',
      description: 'iMac - Reception',
      enrollmentType: 'device'
    }
  ],
  
  // Enable device catalogs for app management
  deviceCatalogs: [
    'catalog-id-apps',
    'catalog-id-updates'
  ],
  
  // macOS-specific configurations
  macOs: {
    // Compliance policy (required)
    compliancePolicy: {
      displayName: 'Corporate macOS Compliance Policy',
      description: 'Compliance requirements for all corporate macOS devices',
      
      // Password requirements
      passwordRequired: true,
      passwordMinimumLength: 12,
      passwordRequiredType: 'alphanumeric',
      passwordMinutesOfInactivityBeforeLock: 15,
      passwordExpirationDays: 90,
      passwordPreviousPasswordBlockCount: 5,
      
      // OS version requirements
      osMinimumVersion: '13.0',
      osMaximumVersion: '14.9',
      
      // Security requirements
      systemIntegrityProtectionEnabled: true,
      firewallEnabled: true,
      gatekeeperAllowedAppSource: 'macAppStoreAndIdentifiedDevelopers',
      storageRequireEncryption: true,
      
      // Device security
      deviceThreatProtectionEnabled: true,
      deviceThreatProtectionRequiredSecurityLevel: 'medium',
      
      // Scheduled actions
      scheduledActions: {
        markDeviceNoncompliantDays: 7,
        remotelyLockNoncompliantDeviceDays: 14
      },
      
      // Policy assignment
      assignments: {
        includeAllDevices: false,
        includeGroups: ['all-corporate-macs-group-id'],
        excludeGroups: ['test-devices-group-id']
      }
    },
    
    // Antivirus policy (optional)
    antiVirusPolicy: {
      name: 'Microsoft Defender for macOS',
      description: 'Antivirus and threat protection settings',
      platforms: 'macOS',
      technologies: 'mdm',
      templateReference: {
        templateId: 'e8c053d6-9f95-42b1-a7f1-ebfd71c67a4b'
      },
      settings: [
        {
          settingInstance: {
            '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
            settingDefinitionId: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection',
            choiceSettingValue: {
              value: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection_true',
              children: []
            }
          }
        },
        {
          settingInstance: {
            '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
            settingDefinitionId: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_enabled',
            choiceSettingValue: {
              value: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_enabled_true',
              children: []
            }
          }
        }
      ],
      assignments: {
        includeAllDevices: true
      }
    },
    
    // Disk encryption policy (optional)
    diskEncryptionPolicy: {
      enabled: true,
      allowDeferralUntilSignOut: true,
      numberOfTimesUserCanIgnore: 3,
      personalRecoveryKeyRotationInMonths: 6,
      disablePromptAtSignOut: false,
      assignments: {
        includeAllDevices: true,
        excludeGroups: ['legacy-hardware-group-id']
      }
    },
    
    // Firewall policy (optional)
    firewallPolicy: {
      enabled: true,
      blockAllIncoming: false,
      enableStealthMode: true,
      allowSignedApps: true,
      allowDownloadSignedApps: true,
      assignments: {
        includeAllDevices: true,
        excludeGroups: ['developers-unrestricted-group-id']
      }
    },
    
    // Import custom configuration files (optional)
    importCustomConfigs: [
      {
        name: 'Corporate WiFi Profile',
        description: 'WiFi configuration for office networks',
        filePath: './configs/wifi-corporate.mobileconfig',
        assignments: {
          includeGroups: ['office-employees-group-id']
        }
      },
      {
        name: 'VPN Configuration',
        description: 'Corporate VPN settings',
        filePath: './configs/vpn-config.mobileconfig',
        assignments: {
          includeAllDevices: true
        }
      }
    ],
    
    // Import custom configuration folders (optional)
    importCustomConfigsFolders: [
      {
        folderPath: './configs/standard-macos',
        filePattern: '*.mobileconfig',
        recursive: false,
        assignments: {
          includeAllDevices: true
        }
      }
    ]
  }
}, {
  // Pulumi resource options
  protect: true,
  dependsOn: [/* other resources */]
});

// Export outputs
export const compliancePolicyId = intune.getOutputs().compliancePolicyId;
export const antivirusPolicyId = intune.getOutputs().antivirusPolicyId;
```

## macOS Compliance Policy Details

### Password Settings

```typescript
{
  passwordRequired: true,                           // Require password
  passwordMinimumLength: 12,                        // Minimum 12 characters
  passwordRequiredType: 'alphanumeric',             // alphanumeric | numeric
  passwordMinutesOfInactivityBeforeLock: 15,        // Lock after 15 minutes
  passwordExpirationDays: 90,                       // Expire every 90 days
  passwordPreviousPasswordBlockCount: 5,            // Remember last 5 passwords
}
```

### OS Version Requirements

```typescript
{
  osMinimumVersion: '13.0',  // Minimum macOS version (e.g., Ventura)
  osMaximumVersion: '14.9',  // Maximum macOS version (e.g., Sonoma)
}
```

### Security Requirements

```typescript
{
  systemIntegrityProtectionEnabled: true,           // Require SIP enabled
  firewallEnabled: true,                            // Require firewall on
  gatekeeperAllowedAppSource: 'macAppStoreAndIdentifiedDevelopers',
  storageRequireEncryption: true,                   // Require FileVault
  deviceThreatProtectionEnabled: true,              // Enable Microsoft Defender
  deviceThreatProtectionRequiredSecurityLevel: 'medium',  // low | medium | high
}
```

### Scheduled Actions

```typescript
{
  scheduledActions: {
    markDeviceNoncompliantDays: 7,              // Mark non-compliant after 7 days
    remotelyLockNoncompliantDeviceDays: 14      // Lock device after 14 days
  }
}
```

## Disk Encryption Configuration

```typescript
{
  enabled: true,                                   // Enable FileVault
  allowDeferralUntilSignOut: true,                // Allow user to defer until next logout
  numberOfTimesUserCanIgnore: 3,                  // Max deferrals
  personalRecoveryKeyRotationInMonths: 6,         // Rotate key every 6 months
  disablePromptAtSignOut: false                   // Show prompt at sign-out
}
```

## Firewall Configuration

```typescript
{
  enabled: true,                    // Enable macOS firewall
  blockAllIncoming: false,          // Block all incoming connections (use with caution)
  enableStealthMode: true,          // Don't respond to ping/probe requests
  allowSignedApps: true,            // Allow signed applications
  allowDownloadSignedApps: true     // Allow downloaded signed apps
}
```

## Custom Configuration Import

### Single File Import

```typescript
{
  name: 'Configuration Name',
  description: 'Configuration description',
  filePath: './path/to/config.mobileconfig',  // Path to .mobileconfig file
  assignments: {
    includeGroups: ['group-id']
  }
}
```

### Folder Import

```typescript
{
  folderPath: './configs/folder',          // Folder containing configs
  filePattern: '*.mobileconfig',           // File pattern to match
  recursive: false,                        // Search subdirectories
  assignments: {
    includeAllDevices: true
  }
}
```

## Corporate Device Identifiers

Register corporate-owned devices for automatic enrollment:

```typescript
{
  corporateDeviceIdentifiers: [
    {
      identifier: 'XX:XX:XX:XX:XX:XX',  // MAC address or serial number
      description: 'Device description',
      enrollmentType: 'device'            // device | user
    }
  ]
}
```

## Device Catalogs

Enable specific device catalogs:

```typescript
{
  deviceCatalogs: [
    'catalog-id-1',
    'catalog-id-2'
  ]
}
```

## Assignment Options

All policies support flexible assignment targeting:

### Include All Devices
```typescript
assignments: {
  includeAllDevices: true
}
```

### Include Specific Groups
```typescript
assignments: {
  includeGroups: ['group-id-1', 'group-id-2']
}
```

### Exclude Groups
```typescript
assignments: {
  includeAllDevices: true,
  excludeGroups: ['test-group-id']
}
```

### Complex Assignment
```typescript
assignments: {
  includeGroups: ['all-corporate-macs'],
  excludeGroups: ['legacy-devices', 'test-devices']
}
```

## Resource Outputs

Access component outputs:

```typescript
const intune = new IntuneManagement('intune', {/* config */});

// Get all outputs
const outputs = intune.getOutputs();

// Export specific outputs
export const compliancePolicyId = outputs.compliancePolicyId;
export const antivirusPolicyId = outputs.antivirusPolicyId;
export const diskEncryptionPolicyId = outputs.diskEncryptionPolicyId;
export const firewallPolicyId = outputs.firewallPolicyId;
```

## Best Practices

1. **Start Simple**: Begin with just compliance policy, add other policies incrementally
2. **Test Assignments**: Use test groups before deploying to all devices
3. **Version Control**: Store .mobileconfig files in version control
4. **Document Settings**: Add clear descriptions to all policies
5. **Review Compliance**: Regular review compliance reports in Intune portal
6. **Update OS Requirements**: Keep osMinimumVersion current with security patches
7. **Monitor Deployments**: Check assignment results after policy changes
8. **Use Descriptive Names**: Clear displayName helps in Intune portal
9. **Plan Scheduled Actions**: Consider grace periods for non-compliance
10. **Backup Configs**: Keep backups of custom configuration files

## Common Patterns

### Development Environment
```typescript
const intune = new IntuneManagement('dev-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Dev - macOS Compliance',
      passwordRequired: true,
      passwordMinimumLength: 8,  // Relaxed for dev
      assignments: {
        includeGroups: ['dev-team-group-id']
      }
    }
  }
});
```

### Production Environment
```typescript
const intune = new IntuneManagement('prod-intune', {
  macOs: {
    compliancePolicy: {
      displayName: 'Prod - macOS Compliance',
      passwordRequired: true,
      passwordMinimumLength: 14,  // Stricter for prod
      assignments: {
        includeAllDevices: true,
        excludeGroups: ['test-devices']
      }
    }
  }
});
```

## Troubleshooting

### Policy Not Applying
- Verify group membership in Azure AD
- Check device enrollment status
- Review compliance policy results in Intune portal
- Ensure device has latest Company Portal app

### Authentication Errors
- Verify environment variables are set
- Check service principal permissions
- Ensure Microsoft Graph API permissions are granted

### Configuration Import Failures
- Validate .mobileconfig file syntax
- Check file paths are correct
- Verify file permissions
- Review Microsoft Graph API error messages
