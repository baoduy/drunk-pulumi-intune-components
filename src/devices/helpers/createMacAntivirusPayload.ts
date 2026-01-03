import {ConfigurationArgs, DeviceConfigurationPolicy} from '../types';

export const createMacAntivirusPayload = ({name, description}: ConfigurationArgs): DeviceConfigurationPolicy => {
    return {
        name,
        description: description ?? name,
        roleScopeTagIds: ['0'],
        platforms: 'macOS',
        technologies: 'mdm,microsoftSense',
        templateReference: {
            templateId: '2d345ec2-c817-49e5-9156-3ed416dc972a_1',
        },
        settings: [
            {
                id: '0',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enabled',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '9e424cc6-35b9-48ef-863c-73295aa9d2d7',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enabled_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '7ea0a2aa-0953-4340-b590-522f040b0da3',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '1',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_automaticsamplesubmission',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'd5563bad-08c5-47de-8bbb-5d44e0f9a23a',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_automaticsamplesubmission_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'de57abd5-1a87-463e-96e7-e117524003ba',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '2',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_diagnosticlevel',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'c7a9a79b-20cf-461f-8021-94702a32543b',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_diagnosticlevel_0',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '5fc10db6-9ee5-434a-9ed0-1382bf72969e',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '3',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_automaticdefinitionupdateenabled',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'cc18c6dc-dca5-4845-9c78-c718c9447ddd',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_automaticdefinitionupdateenabled_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '112fd4a8-1393-49b6-9569-0d37266a6ad3',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '4',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enablerealtimeprotection',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '426bd5b7-cf4e-49b6-99fe-f763def46e61',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enablerealtimeprotection_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '3c72c919-e0b9-4ed2-aead-a9c98ea63216',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '5',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_passivemode',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '7246d8d4-3cfb-4423-8b64-4e6a0db9eb62',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_passivemode_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'e4f0126b-24dc-4341-9edc-94577787dc8e',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '6',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_scanhistorymaximumitems',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '46df7588-c7fa-48a1-983b-59fcfff33eec',
                    },
                    simpleSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationIntegerSettingValue',
                        value: 10000,
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'de0f30a5-14f9-4190-82b9-f95aea6438f8',
                            useTemplateDefault: false,
                        },
                    },
                },
            },
            {
                id: '7',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_scanresultsretentiondays',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '6b2a8b5b-379a-461b-b36d-42a12dabd54b',
                    },
                    simpleSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationIntegerSettingValue',
                        value: 90,
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'f97c1b05-9600-4175-9ad4-81fc33bcc3b2',
                            useTemplateDefault: false,
                        },
                    },
                },
            },
            {
                id: '8',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_exclusionsmergepolicy',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'c07a6983-ac3e-4f38-be45-20954638dabd',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_exclusionsmergepolicy_1',
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'effc409a-9169-43f0-a807-2a388875cf99',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '9',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_threattypesettingsmergepolicy',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '65d9ddaf-0552-4e40-8575-71dd54b2ccb4',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_threattypesettingsmergepolicy_0',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '613bcf39-69ec-4a1f-8822-07789ae7f8cb',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '10',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enablefilehashcomputation',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '8472c23f-3f2d-4acf-9386-a0715ad6e591',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enablefilehashcomputation_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '96559430-ea19-4fb6-b98a-c237a2e31ae5',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '11',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_scanafterdefinitionupdate',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '65bc7d9e-a0fc-4e3f-b464-550c30589e3c',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_scanafterdefinitionupdate_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '1d05f27d-cc04-44a3-82f8-91df943b03e4',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '12',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_scanarchives',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '27ca9434-85a0-4175-999d-bbef8eb8d066',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_scanarchives_true',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '26bb4b38-6e8a-4e3d-9045-81314475b3fe',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '13',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enforcementlevel_antivirusengine',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'a1bf7f4c-196e-4930-8395-a9b496433322',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enforcementlevel_antivirusengine_2',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '440003a2-8406-47bb-a785-a45869556ead',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '14',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enforcementlevel',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '94f6f35c-4cee-4a61-930a-491b698c790a',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enforcementlevel_2',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '96ced765-4f68-441a-b9ad-b683cfdfa28f',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '15',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_enforcementlevel_tamperprotection',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '3c4efab3-cf91-4540-b86d-54507c90bb4b',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_enforcementlevel_tamperprotection_2',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '6e25fd09-16f1-42fd-9ffe-954ee1c0b904',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                id: '16',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_consumerexperience',
                    auditRuleInformation: null,
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '1cb52ec2-c861-4c4a-9184-e4cc13eba6ad',
                    },
                    choiceSettingValue: {
                        value: 'com.apple.managedclient.preferences_consumerexperience_1',
                        settingValueTemplateReference: {
                            settingValueTemplateId: '95f4ea0a-5907-4008-931b-652105f937a0',
                            useTemplateDefault: false,
                        },
                        children: [],
                    },
                },
            },
            {
                '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        children: [],
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'fd30f322-4968-4479-8510-ad308ca8abe3',
                        },
                        value: 'com.apple.managedclient.preferences_hidestatusmenuicon_true',
                    },
                    settingDefinitionId: 'com.apple.managedclient.preferences_hidestatusmenuicon',
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '1b9f3e2b-46e8-4346-935d-dd0bd8ad2443',
                    },
                },
            },
            {
                '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance',
                    choiceSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationChoiceSettingValue',
                        children: [],
                        settingValueTemplateReference: {
                            settingValueTemplateId: '41df6cea-c66a-44a6-b37b-c73c811a898c',
                        },
                        value: 'com.apple.managedclient.preferences_userinitiatedfeedback_0',
                    },
                    settingDefinitionId: 'com.apple.managedclient.preferences_userinitiatedfeedback',
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: '4423d695-27c2-4266-b253-bff098657834',
                    },
                },
            },
            {
                '@odata.type': '#microsoft.graph.deviceManagementConfigurationSetting',
                settingInstance: {
                    '@odata.type': '#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance',
                    settingDefinitionId: 'com.apple.managedclient.preferences_maximumondemandscanthreads',
                    settingInstanceTemplateReference: {
                        settingInstanceTemplateId: 'e02fd3ba-4146-4b7d-9c7f-dffec96465e5',
                    },
                    simpleSettingValue: {
                        '@odata.type': '#microsoft.graph.deviceManagementConfigurationIntegerSettingValue',
                        settingValueTemplateReference: {
                            settingValueTemplateId: 'fe25bbb2-f6de-480a-9153-11f90d7dab4e',
                        },
                        value: 2,
                    },
                },
            },
        ],
    };
}