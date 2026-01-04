import {MacOSCompliancePolicy} from "@microsoft/microsoft-graph-types-beta";

export type ConfigurationArgs = {
    name: string;
    description?: string;
};

export type MacDeviceCompliance = MacOSCompliancePolicy & {
    readonly '@odata.type': '#microsoft.graph.macOSCompliancePolicy';
};

export type DeviceConfigurationPolicy = {
    readonly name?: string;
    readonly description?: string;
    readonly settings?: Setting[];
    readonly roleScopeTagIds?: string[];
    readonly platforms?: string;
    readonly technologies?: string;
    readonly templateReference?: TemplateReference;
}

export type Setting = {
    readonly id?: string;
    readonly settingInstance?: SettingInstance;
    readonly "@odata.type"?: string;
}

export type SettingInstance = {
    readonly "@odata.type"?: string;
    readonly settingDefinitionId?: string;
    readonly auditRuleInformation?: null;
    readonly settingInstanceTemplateReference?: SettingInstanceTemplateReference;
    readonly choiceSettingValue?: ChoiceSettingValue;
    readonly groupSettingCollectionValue?: GroupSettingCollectionValue[];
    readonly simpleSettingValue?: SimpleSettingValue;
}

export type ChoiceSettingValue = {
    readonly value?: string;
    readonly settingValueTemplateReference?: SettingValueTemplateReference;
    readonly children?: any[];
    readonly "@odata.type"?: string;
}

export type SettingValueTemplateReference = {
    readonly settingValueTemplateId?: string;
    readonly useTemplateDefault?: boolean;
}

export type GroupSettingCollectionValue = {
    readonly children?: Child[];
}

export type Child = {
    readonly "@odata.type"?: string;
    readonly settingDefinitionId?: string;
    readonly choiceSettingValue?: ChoiceSettingValue;
    readonly groupSettingCollectionValue?: GroupSettingCollectionValue[];
    readonly settingInstanceTemplateReference?: SettingInstanceTemplateReference,
    readonly simpleSettingValue?: SimpleSettingValue;
}

export type SettingInstanceTemplateReference = {
    readonly settingInstanceTemplateId?: string;
}

export type SimpleSettingValue = {
    readonly "@odata.type"?: string;
    readonly value?: number | string;
    readonly settingValueTemplateReference?: SettingValueTemplateReference;
}
export type TemplateReference = {
    readonly templateId?: string;
}

export type CustomConfiguration = {
    readonly "@odata.type"?: "#microsoft.graph.macOSCustomConfiguration";
    readonly id?: string;
    readonly roleScopeTagIds?: string[];
    readonly description?: string;
    readonly displayName?: string;
    readonly payloadName?: string;
    readonly payloadFileName?: string;
    readonly payload?: string;
    readonly deploymentChannel?: 'deviceChannel';
}
