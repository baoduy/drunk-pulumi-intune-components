import {ConfigurationArgs, DeviceConfigurationPolicy} from '../types';

export type MacDiskEncryptionPayloadArgs = ConfigurationArgs & {
    fileVaultRecoveryKeyEscrow?: string;
};

export const createMacDiskEncryptionPayload = ({
                                                   name,
                                                   description,
                                                   fileVaultRecoveryKeyEscrow
                                               }: MacDiskEncryptionPayloadArgs): DeviceConfigurationPolicy => {
    return {
        name,
        description: description ?? name,
        platforms: 'macOS',
        technologies: 'mdm,appleRemoteManagement',
        roleScopeTagIds: ['0'],
        "settings": [
            {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
                "settingInstance": {
                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance",
                    "settingDefinitionId": "com.apple.mcx.filevault2_com.apple.mcx.filevault2",
                    "groupSettingCollectionValue": [
                        {
                            "children": [
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
                                    "settingDefinitionId": "com.apple.mcx.filevault2_deferdontaskatuserlogout",
                                    "choiceSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                                        "value": "com.apple.mcx.filevault2_deferdontaskatuserlogout_false",
                                        "children": []
                                    }
                                },
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
                                    "settingDefinitionId": "com.apple.mcx.filevault2_deferforceatuserloginmaxbypassattempts",
                                    "simpleSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationIntegerSettingValue",
                                        "value": 0
                                    }
                                },
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
                                    "settingDefinitionId": "com.apple.mcx.filevault2_enable",
                                    "choiceSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                                        "value": "com.apple.mcx.filevault2_enable_0",
                                        "children": []
                                    }
                                },
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
                                    "settingDefinitionId": "com.apple.mcx.filevault2_recoverykeyrotationinmonths",
                                    "choiceSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                                        "value": "com.apple.mcx.filevault2_recoverykeyrotationinmonths_12",
                                        "children": []
                                    }
                                },
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingInstance",
                                    "settingDefinitionId": "com.apple.mcx.filevault2_userecoverykey",
                                    "choiceSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationChoiceSettingValue",
                                        "value": "com.apple.mcx.filevault2_userecoverykey_true",
                                        "children": []
                                    }
                                }
                            ]
                        }
                    ],
                    "settingInstanceTemplateReference": {
                        "settingInstanceTemplateId": "0e20e909-e28a-41a1-8541-5aadd4714d7d"
                    }
                }
            },
            {
                "@odata.type": "#microsoft.graph.deviceManagementConfigurationSetting",
                "settingInstance": {
                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationGroupSettingCollectionInstance",
                    "settingDefinitionId": "com.apple.security.fderecoverykeyescrow_com.apple.security.fderecoverykeyescrow",
                    "groupSettingCollectionValue": [
                        {
                            "children": [
                                {
                                    "@odata.type": "#microsoft.graph.deviceManagementConfigurationSimpleSettingInstance",
                                    "settingDefinitionId": "com.apple.security.fderecoverykeyescrow_location",
                                    "simpleSettingValue": {
                                        "@odata.type": "#microsoft.graph.deviceManagementConfigurationStringSettingValue",
                                        "value": fileVaultRecoveryKeyEscrow ?? "Please contact IT-HelpDesk for help"
                                    }
                                }
                            ]
                        }
                    ],
                    "settingInstanceTemplateReference": {
                        "settingInstanceTemplateId": "6f9cb7be-2e50-408a-b24b-6e1387a07fc7"
                    }
                }
            }
        ],
        "templateReference": {
            "templateId": "e688156f-6564-4c03-b34f-83b90fe6bb82_1",
            "templateFamily": "endpointSecurityDiskEncryption",
            "templateDisplayName": "MacOS Filevault",
            "templateDisplayVersion": "Version 1"
        }
    };
}
