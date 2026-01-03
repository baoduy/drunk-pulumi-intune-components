import {MacCompliancePolicyInputs} from './MacCompliancePolicy';
import {MacDeviceCompliance} from './types';

export function createMacCompliancePayload(args: MacCompliancePolicyInputs): MacDeviceCompliance {
    const {displayName, description, passwordRequired, scheduledActions, ...props} = args;
    const requiredPassword = passwordRequired ?? true;

    return {
        '@odata.type': '#microsoft.graph.macOSCompliancePolicy',
        roleScopeTagIds: ['0'],
        description: description ?? 'Compliance policy for MacOS devices',
        displayName: displayName ?? 'MACOS Compliance Policy',
        passwordRequired: requiredPassword,
        passwordBlockSimple: true,
        //passwordExpirationDays: null,
        passwordMinimumLength: 8,
        //passwordMinutesOfInactivityBeforeLock: null,
        //passwordPreviousPasswordBlockCount: null,
        passwordMinimumCharacterSetCount: 1,
        passwordRequiredType: 'deviceDefault',
        osMinimumVersion: '14',
        osMaximumVersion: '26.2',
        systemIntegrityProtectionEnabled: true,
        deviceThreatProtectionEnabled: false,
        deviceThreatProtectionRequiredSecurityLevel: 'secured',
        advancedThreatProtectionRequiredSecurityLevel: 'secured',
        gatekeeperAllowedAppSource: 'macAppStoreAndIdentifiedDevelopers',
        storageRequireEncryption: true,
        firewallEnabled: true,
        firewallBlockAllIncoming: false,
        firewallEnableStealthMode: false,
        //Allows to override default values
        ...props,
        // assignments: assignments ?? [
        //     {
        //         id: `${id}_adadadad-808e-44e2-905a-0b7873a8a531`,
        //         source: 'direct',
        //         sourceId: id,
        //         target: {
        //             deviceAndAppManagementAssignmentFilterId: null,
        //             deviceAndAppManagementAssignmentFilterType: 'none',
        //         },
        //     },
        //     {
        //         id: `${id}_acacacac-9df4-4c7d-9d50-4ef0226f57a9`,
        //         source: 'direct',
        //         sourceId: id,
        //         target: {
        //             deviceAndAppManagementAssignmentFilterId: null,
        //             deviceAndAppManagementAssignmentFilterType: 'none',
        //         },
        //     },
        // ],
        scheduledActionsForRule: [
            {
                ruleName: null,
                scheduledActionConfigurations: [
                    {
                        actionType: 'block',
                        gracePeriodHours: scheduledActions?.markDeviceNoncompliantDays
                            ? scheduledActions.markDeviceNoncompliantDays * 24
                            : 0,
                        notificationTemplateId: '00000000-0000-0000-0000-000000000000',
                        notificationMessageCCList: [],
                    },
                    {
                        actionType: 'remoteLock',
                        gracePeriodHours: scheduledActions?.remotelyLockNoncompliantDeviceDays
                            ? scheduledActions.remotelyLockNoncompliantDeviceDays * 24
                            : 0,
                        notificationTemplateId: '00000000-0000-0000-0000-000000000000',
                        notificationMessageCCList: [],
                    },
                ],
            },
        ],
    };
}
