# Device Policies - Drunk Pulumi Intune Components

## Overview

The library provides comprehensive device policy components for managing macOS device configurations, compliance, and security settings through Microsoft Intune.

## Policy Types

### 1. Compliance Policies
Define device compliance requirements that devices must meet.

### 2. Configuration Policies
Configure specific device settings and features.

### 3. Custom Policies
Deploy custom configuration profiles to devices.

### 4. Policy Assignments
Control which devices or groups receive specific policies.

## macOS Compliance Policy

### Component: MacCompliancePolicyResource

Manages macOS device compliance requirements.

#### Basic Usage

```typescript
import { MacCompliancePolicyResource } from '@drunk-pulumi/intune-components';

const compliancePolicy = new MacCompliancePolicyResource('macos-compliance', {
  displayName: 'Corporate macOS Compliance',
  description: 'Baseline compliance for all corporate Macs',
  
  // Password requirements
  passwordRequired: true,
  passwordMinimumLength: 12,
  passwordRequiredType: 'alphanumeric',
  passwordMinutesOfInactivityBeforeLock: 15,
  passwordExpirationDays: 90,
  passwordPreviousPasswordBlockCount: 5,
  
  // OS requirements
  osMinimumVersion: '13.0',
  osMaximumVersion: '14.9',
  
  // Security
  systemIntegrityProtectionEnabled: true,
  firewallEnabled: true,
  storageRequireEncryption: true,
  
  // Scheduled actions
  scheduledActions: {
    markDeviceNoncompliantDays: 7,
    remotelyLockNoncompliantDeviceDays: 14
  }
});
```

#### Password Policy Options

```typescript
{
  passwordRequired: true | false,
  passwordMinimumLength: number,           // 4-16 characters
  passwordRequiredType: 
    | 'deviceDefault'
    | 'alphanumeric'
    | 'numeric',
  passwordMinutesOfInactivityBeforeLock: number,  // 1-60 minutes
  passwordExpirationDays: number,          // 1-365 days
  passwordPreviousPasswordBlockCount: number,      // 1-24 passwords
  passwordMinimumCharacterSetCount: number,        // 0-4 character sets
}
```

#### OS Version Requirements

```typescript
{
  osMinimumVersion: string,     // e.g., '13.0' (Ventura)
  osMaximumVersion: string,     // e.g., '14.9' (Sonoma)
  osMinimumBuildVersion: string,
  osMaximumBuildVersion: string
}
```

#### Security Requirements

```typescript
{
  systemIntegrityProtectionEnabled: true,
  firewallEnabled: true,
  gatekeeperAllowedAppSource: 
    | 'notConfigured'
    | 'macAppStore'
    | 'macAppStoreAndIdentifiedDevelopers'
    | 'anywhere',
  storageRequireEncryption: true,
  deviceThreatProtectionEnabled: true,
  deviceThreatProtectionRequiredSecurityLevel:
    | 'unavailable'
    | 'secured'
    | 'low'
    | 'medium'
    | 'high'
    | 'notSet'
}
```

## macOS Configuration Policies

### Component: ConfigurationPolicyResource

Manages device configuration policies using Microsoft Graph settings catalog.

#### Basic Usage

```typescript
import { ConfigurationPolicyResource } from '@drunk-pulumi/intune-components';

const configPolicy = new ConfigurationPolicyResource('macos-config', {
  name: 'macOS Security Configuration',
  description: 'Security settings for macOS devices',
  platforms: 'macOS',
  technologies: 'mdm',
  templateReference: {
    templateId: 'template-guid'
  },
  settings: [
    {
      settingInstance: {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId: 'setting-definition-id',
        choiceSettingValue: {
          value: 'setting-value',
          children: []
        }
      }
    }
  ]
});
```

#### Platform Options

- `macOS`: macOS devices
- `iOS`: iOS/iPadOS devices
- `windows10`: Windows 10/11 devices
- `android`: Android devices

#### Technology Options

- `mdm`: Mobile Device Management
- `microsoftSense`: Microsoft Defender for Endpoint
- `exchangeOnline`: Exchange Online settings
- `configurationManager`: Configuration Manager

## Antivirus Policy

Configure Microsoft Defender for macOS:

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const antivirusPolicy = {
  name: 'Microsoft Defender - macOS',
  description: 'Antivirus and threat protection',
  platforms: 'macOS',
  settings: [
    // Real-time protection
    {
      settingInstance: {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection',
        choiceSettingValue: {
          value: 'device_vendor_msft_defender_configuration_antivirusengine_enablerealtimedprotection_true'
        }
      }
    },
    // Cloud-delivered protection
    {
      settingInstance: {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_enabled',
        choiceSettingValue: {
          value: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_enabled_true'
        }
      }
    },
    // Automatic sample submission
    {
      settingInstance: {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_automaticsamplesubmission',
        choiceSettingValue: {
          value: 'device_vendor_msft_defender_configuration_clouddeliveredprotection_automaticsamplesubmission_true'
        }
      }
    },
    // Scan type
    {
      settingInstance: {
        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
        settingDefinitionId: 'device_vendor_msft_defender_configuration_antivirusengine_scantype',
        choiceSettingValue: {
          value: 'device_vendor_msft_defender_configuration_antivirusengine_scantype_quick'
        }
      }
    }
  ]
};
```

## Disk Encryption Policy

Configure FileVault disk encryption:

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const diskEncryptionPolicy = deviceHelpers.createMacDiskEncryptionPayload({
  enabled: true,
  allowDeferralUntilSignOut: true,
  numberOfTimesUserCanIgnore: 3,
  personalRecoveryKeyRotationInMonths: 6,
  disablePromptAtSignOut: false,
  escrowLocationDescription: 'Recovery key is stored in company portal'
});
```

#### Disk Encryption Options

```typescript
{
  enabled: true | false,                      // Enable FileVault
  allowDeferralUntilSignOut: true | false,   // Allow user to defer
  numberOfTimesUserCanIgnore: number,         // 0-10 deferrals
  personalRecoveryKeyRotationInMonths: number, // 1-12 months
  disablePromptAtSignOut: true | false,       // Prompt behavior
  escrowLocationDescription: string           // Where key is stored
}
```

## Firewall Policy

Configure macOS firewall settings:

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const firewallPolicy = deviceHelpers.createMacFirewallPayload({
  enabled: true,
  blockAllIncoming: false,
  enableStealthMode: true,
  allowSignedApps: true,
  allowDownloadSignedApps: true,
  applications: [
    {
      bundleId: 'com.microsoft.teams',
      allowed: true
    },
    {
      bundleId: 'com.zoom.us',
      allowed: true
    }
  ]
});
```

#### Firewall Options

```typescript
{
  enabled: true | false,                  // Enable firewall
  blockAllIncoming: true | false,         // Block all incoming (caution!)
  enableStealthMode: true | false,        // Don't respond to probes
  allowSignedApps: true | false,          // Allow signed apps
  allowDownloadSignedApps: true | false,  // Allow downloaded signed apps
  applications: Array<{                    // App-specific rules
    bundleId: string,
    allowed: boolean
  }>
}
```

## Custom Policies

### Component: CustomPolicyResource

Deploy custom configuration profiles:

```typescript
import { CustomPolicyResource } from '@drunk-pulumi/intune-components';

const customPolicy = new CustomPolicyResource('custom-wifi', {
  name: 'Corporate WiFi Profile',
  description: 'WiFi configuration for office networks',
  payload: {
    '@odata.type': '#microsoft.graph.macOSCustomConfiguration',
    payloadFileName: 'wifi-config.mobileconfig',
    payload: Buffer.from(mobileConfigXML).toString('base64')
  }
});
```

### Custom Configuration Import

#### Import Single File

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const customConfig = deviceHelpers.createMacCustomConfig({
  name: 'VPN Configuration',
  description: 'Corporate VPN settings',
  filePath: './configs/vpn.mobileconfig'
});
```

#### Import Multiple Files

```typescript
import { DeviceCustomConfiguration } from '@drunk-pulumi/intune-components';

const configs = new DeviceCustomConfiguration('custom-configs', {
  configs: [
    {
      name: 'WiFi Profile',
      filePath: './configs/wifi.mobileconfig'
    },
    {
      name: 'Email Settings',
      filePath: './configs/email.mobileconfig'
    },
    {
      name: 'Certificate',
      filePath: './configs/cert.mobileconfig'
    }
  ]
});
```

#### Import from Directory

```typescript
import { DeviceCustomConfigurationImporter } from '@drunk-pulumi/intune-components';

const importer = new DeviceCustomConfigurationImporter('import-configs', {
  folderPath: './configs/macos',
  filePattern: '*.mobileconfig',
  recursive: false
});
```

## Policy Assignments

### Component: CompliancePolicyAssignmentResource

Assign compliance policies to groups:

```typescript
import { CompliancePolicyAssignmentResource } from '@drunk-pulumi/intune-components';

const assignment = new CompliancePolicyAssignmentResource('compliance-assignment', {
  compliancePolicyId: compliancePolicy.id,
  includeAllDevices: false,
  includeGroups: ['group-id-1', 'group-id-2'],
  excludeGroups: ['test-group-id']
});
```

### Component: ConfigurationPolicyAssignmentResource

Assign configuration policies to groups:

```typescript
import { ConfigurationPolicyAssignmentResource } from '@drunk-pulumi/intune-components';

const assignment = new ConfigurationPolicyAssignmentResource('config-assignment', {
  configPolicyId: configPolicy.id,
  configType: 'configurationPolicies',
  includeAllDevices: true,
  excludeGroups: ['legacy-devices-group-id']
});
```

### Assignment Options

All assignments support these options:

```typescript
{
  includeAllDevices?: boolean,        // Target all devices
  includeGroups?: string[],           // Target specific groups
  excludeGroups?: string[]            // Exclude specific groups
}
```

#### Assignment Patterns

**All Devices**:
```typescript
{ includeAllDevices: true }
```

**Specific Groups**:
```typescript
{ includeGroups: ['group-1', 'group-2'] }
```

**All Except**:
```typescript
{
  includeAllDevices: true,
  excludeGroups: ['test-devices']
}
```

**Targeted with Exclusions**:
```typescript
{
  includeGroups: ['corporate-macs'],
  excludeGroups: ['contractors', 'legacy-hardware']
}
```

## Policy Helpers

The library provides helper functions for common policy configurations:

### createMacCompliancePayload

```typescript
import { deviceHelpers } from '@drunk-pulumi/intune-components';

const payload = deviceHelpers.createMacCompliancePayload({
  displayName: 'Compliance Policy',
  passwordRequired: true,
  // ... other compliance settings
});
```

### createMacAntivirusPayload

```typescript
const payload = deviceHelpers.createMacAntivirusPayload({
  realTimeProtection: true,
  cloudDeliveredProtection: true,
  automaticSampleSubmission: true
});
```

### createMacDiskEncryptionPayload

```typescript
const payload = deviceHelpers.createMacDiskEncryptionPayload({
  enabled: true,
  numberOfTimesUserCanIgnore: 3
});
```

### createMacFirewallPayload

```typescript
const payload = deviceHelpers.createMacFirewallPayload({
  enabled: true,
  blockAllIncoming: false,
  enableStealthMode: true
});
```

## Best Practices

### Policy Organization

1. **Separate Concerns**: Create separate policies for different purposes
2. **Descriptive Names**: Use clear, descriptive policy names
3. **Version Descriptions**: Include version or date in descriptions
4. **Group Logically**: Group related settings in single policy

### Assignment Strategy

1. **Start Small**: Test with pilot groups before full deployment
2. **Use Exclusions**: Exclude test/development devices
3. **Progressive Rollout**: Deploy to groups incrementally
4. **Monitor Compliance**: Check compliance reports regularly

### Security Configurations

1. **Layer Security**: Combine multiple security policies
2. **Regular Updates**: Keep OS version requirements current
3. **Strong Passwords**: Enforce strong password policies
4. **Encryption Always**: Require disk encryption
5. **Enable Antivirus**: Deploy antivirus to all devices

### Custom Configurations

1. **Test Profiles**: Test .mobileconfig files before deployment
2. **Version Control**: Store profiles in version control
3. **Document Settings**: Add comments to profile files
4. **Validate XML**: Ensure XML is well-formed
5. **Use Signing**: Sign profiles for production use

### Testing Workflow

1. Create policy
2. Assign to test group
3. Verify on test devices
4. Monitor compliance results
5. Adjust policy as needed
6. Expand to production groups

## Common Policy Combinations

### Basic Security Stack

```typescript
{
  compliancePolicy: {
    passwordRequired: true,
    storageRequireEncryption: true,
    firewallEnabled: true
  },
  antiVirusPolicy: { /* defender settings */ },
  diskEncryptionPolicy: { enabled: true },
  firewallPolicy: { enabled: true }
}
```

### High Security Stack

```typescript
{
  compliancePolicy: {
    passwordRequired: true,
    passwordMinimumLength: 14,
    storageRequireEncryption: true,
    systemIntegrityProtectionEnabled: true,
    deviceThreatProtectionEnabled: true,
    deviceThreatProtectionRequiredSecurityLevel: 'high'
  },
  antiVirusPolicy: { /* all protections enabled */ },
  diskEncryptionPolicy: { 
    enabled: true,
    numberOfTimesUserCanIgnore: 0 
  },
  firewallPolicy: { 
    enabled: true,
    enableStealthMode: true 
  }
}
```

### Development Environment

```typescript
{
  compliancePolicy: {
    passwordRequired: true,
    passwordMinimumLength: 8,
    storageRequireEncryption: true
  },
  // Relaxed policies for development
}
```

## Troubleshooting

### Policy Not Applying
- Check device enrollment status
- Verify group membership
- Review assignment filters
- Check policy conflicts

### Configuration Profile Errors
- Validate .mobileconfig XML syntax
- Check payload identifiers are unique
- Verify signing certificates
- Review error logs in Company Portal

### Compliance Issues
- Review compliance report details
- Check device OS version
- Verify security settings
- Allow time for policy sync (up to 8 hours)

### Assignment Problems
- Verify group IDs are correct
- Check Azure AD group membership
- Review exclusion groups
- Ensure device is enrolled in Intune
