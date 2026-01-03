import {ConfigurationArgs, DeviceConfigurationPolicy, GroupSettingCollectionValue} from '../types';

export type MacFirewallConfigurationArgs = ConfigurationArgs & {
    enableStealthMode?: boolean;
    blockAllIncoming?: boolean;
    allowBuiltInApps?: boolean;
    allowSignedApps?: boolean;
    allowedApplications?: string[];
};

export const createMacFirewallPayload = ({
                                             name,
                                             description,
                                             allowBuiltInApps,
                                             allowSignedApps,
                                             allowedApplications,
                                             blockAllIncoming,
                                             enableStealthMode,
                                         }: MacFirewallConfigurationArgs): DeviceConfigurationPolicy => {

    const groupSettingCollectionValue: GroupSettingCollectionValue[] = [
        {
            children: [
                {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.security.firewall_enablestealthmode',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        value: `com.apple.security.firewall_enablestealthmode_${enableStealthMode ? 'true' : 'false'}`,
                        children: [],
                    },
                },
                {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.security.firewall_enablefirewall',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        value: 'com.apple.security.firewall_enablefirewall_true',
                        children: [],
                    },
                },
                {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.security.firewall_blockallincoming',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        value: `com.apple.security.firewall_blockallincoming_${blockAllIncoming ? 'true' : 'false'}`,
                        children: [],
                    },
                },
                {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.security.firewall_allowsigned',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        value: `com.apple.security.firewall_allowsigned_${allowBuiltInApps ? 'true' : 'false'}`,
                        children: [],
                    },
                },
                {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.security.firewall_allowsignedapp',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        value: `com.apple.security.firewall_allowsignedapp_${allowSignedApps ? 'true' : 'false'}`,
                        children: [],
                    },
                },
            ],
        },
    ];

    if (allowedApplications && allowedApplications.length > 0) {
        groupSettingCollectionValue[0].children!.push({
            '@odata.type': '#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance',
            settingDefinitionId: 'com.apple.security.firewall_applications',
            groupSettingCollectionValue: allowedApplications.map((appId) => ({
                children: [
                    {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                        settingDefinitionId: 'com.apple.security.firewall_applications_item_allowed',
                        choiceSettingValue: {
                            '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                            value: 'com.apple.security.firewall_applications_item_allowed_true',
                            children: [],
                        },
                    },
                    {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
                        settingDefinitionId: 'com.apple.security.firewall_applications_item_bundleid',
                        simpleSettingValue: {
                            '@odata.type': '#microsoft.graph.deviceManagementConfigurationStringSettingValue',
                            value: appId,
                        },
                    },
                ],
            }))

        },);
    }

    return {
        name,
        description: description ?? name,
        platforms: 'macOS',
        technologies: 'mdm,appleRemoteManagement',
        roleScopeTagIds: ['0'],
        settings: [
            {
                '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance',
                    settingDefinitionId: 'com.apple.security.firewall_com.apple.security.firewall',
                    groupSettingCollectionValue,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '1d79203d-05b3-41d2-b435-0403fc4141cb',
                    },
                },
            },
        ],
        templateReference: {
            templateId: 'de730c94-09d5-4972-9672-1b9cefe77b64_1',
        },
    };
}
