import {MacCompliancePolicyInputs} from "./MacCompliancePolicy";
import {MacDeviceCompliance} from "./types";


export function createMacCompliancePayload(args: MacCompliancePolicyInputs): MacDeviceCompliance {
    const {displayName, description,assignments, scheduledActions, ...props} = args;
    return {
        "@odata.type": "#microsoft.graph.macOSCompliancePolicy",
        roleScopeTagIds: ['0'],
        description: description ?? 'Compliance policy for MacOS devices',
        displayName: displayName ?? 'MACOS Compliance Policy',
        passwordRequired: true,
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
        // assignments:assignments?? [
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
        // scheduledActionsForRule: [
        //     {
        //         id: id,
        //         ruleName: 'Default Rule',
        //         scheduledActionConfigurations: [
        //             {
        //                 id: 'a0f86254-80d4-450c-91c5-e190c2e48227',
        //                 gracePeriodHours: scheduledActions?.markDeviceNoncompliantHours ?? 2 * 24, //2 days
        //                 actionType: 'block',
        //                 notificationTemplateId: '00000000-0000-0000-0000-000000000000',
        //                 notificationMessageCCList: [],
        //             },
        //             {
        //                 id: '5116a38a-f2f2-41ad-bdea-594424382693',
        //                 gracePeriodHours: scheduledActions?.remotelyLockNoncompliantDeviceHours ?? 2 * 24, //2 days
        //                 actionType: 'remoteLock',
        //                 notificationTemplateId: '00000000-0000-0000-0000-000000000000',
        //                 notificationMessageCCList: [],
        //             },
        //         ],
        //     },
        // ],
    };
}
