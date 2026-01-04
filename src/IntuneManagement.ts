import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
    CompliancePolicyAssignmentInputs,
    CompliancePolicyAssignmentResource,
    ConfigurationPolicyAssignmentInputs,
    CorporateDeviceIdentifierArgs,
    CorporateDeviceIdentifiersResource,
    DefaultPlatformRestrictionsResource,
    deviceTypes,
    MacCompliancePolicyInputs,
    MacCompliancePolicyResource
} from "./devices";
import deviceHelpers, {
    CustomConfigArgs,
    MacDiskEncryptionPayloadArgs,
    MacFirewallConfigurationArgs
} from "./devices/helpers";
import * as types from "./types";
import {DeviceConfiguration} from "./DeviceConfiguration";
import {DeviceCustomConfiguration} from "./DeviceCustomConfiguration";

type AssignmentType = { assignments: types.AsInput<Omit<ConfigurationPolicyAssignmentInputs, 'configPolicyId'>> };
type MacCompliancePolicyType = types.AsInput<MacCompliancePolicyInputs> & {
    assignments: types.AsInput<Omit<CompliancePolicyAssignmentInputs, 'compliancePolicyId'>>
};
type ConfigurationPolicyType = deviceTypes.ConfigurationArgs & AssignmentType;

export interface IntuneManagementArgs {
    /** The intuneId of the Intune instance can be found when updating the DefaultPlatformRestrictions*/
    intuneId?: pulumi.Input<string>;
    corporateDeviceIdentifiers?: CorporateDeviceIdentifierArgs[];
    macOs?: {
        compliancePolicy: MacCompliancePolicyType;
        antiVirusPolicy: ConfigurationPolicyType;
        diskEncryptionPolicy: MacDiskEncryptionPayloadArgs & AssignmentType;
        firewallPolicy?: MacFirewallConfigurationArgs & AssignmentType;
        importCustomConfigs?: Array<CustomConfigArgs & AssignmentType>
    },
}

export class IntuneManagement extends BaseComponent<IntuneManagementArgs> {
    constructor(name: string, args: IntuneManagementArgs, opts?: pulumi.ComponentResourceOptions) {
        super('IntuneManagement', name, args, opts);

        this.createMacPolicies();
        this.createPlatformRestrictions();
        this.createCorporateDeviceIdentifiers();
    }

    public getOutputs(): pulumi.Inputs | pulumi.Output<pulumi.Inputs> {
        return {};
    }

    private createMacCompliancePolicy(args: MacCompliancePolicyType) {
        const {assignments, ...others} = args;
        const policy = new MacCompliancePolicyResource(`${this.name}-mac-compliance-policy`, others, {
            ...this.opts,
            parent: this,
            deleteBeforeReplace: true,
        });

        if (assignments)
            new CompliancePolicyAssignmentResource(`${this.name}-mac-compliance-assignment`, {
                ...assignments,
                compliancePolicyId: policy.id
            }, {
                dependsOn: policy,
                deletedWith: policy,
                deleteBeforeReplace: true,
                parent: this
            });
    }

    private createMacAntivirusPolicy(args: ConfigurationPolicyType) {
        const {assignments, ...props} = args;
        return new DeviceConfiguration(`${this.name}-mac-antivirus`, {
            ...deviceHelpers.createMacAntivirusPayload(props),
            assignments,
        }, {parent: this});

    }

    private createMacDiskEncryptionPolicy(args: MacDiskEncryptionPayloadArgs & AssignmentType) {
        const {assignments, ...props} = args;
        return new DeviceConfiguration(`${this.name}-mac-disk-encryption`, {
            ...deviceHelpers.createMacDiskEncryptionPayload(props),
            assignments,
        }, {parent: this});
    }

    private createMacFirewallPolicy(args: MacFirewallConfigurationArgs & AssignmentType) {
        const {assignments, ...props} = args;
        return new DeviceConfiguration(`${this.name}-mac-firewall-policy`, {
            ...deviceHelpers.createMacFirewallPayload(props),
            assignments,
        }, {parent: this});
    }

    private importMacCustomConfigs(config: Array<CustomConfigArgs & AssignmentType>) {
        return config.map((cfg) => new DeviceCustomConfiguration(`${this.name}-mac-custom-${cfg.name.replace(/\s+/g, '').toLowerCase()}`,
            cfg,
            {parent: this}));
    }

    private createMacPolicies() {
        const {macOs} = this.args;
        if (!macOs) return undefined;

        this.createMacCompliancePolicy(macOs.compliancePolicy);

        if (macOs.antiVirusPolicy) {
            this.createMacAntivirusPolicy(macOs.antiVirusPolicy);
        }
        if (macOs.diskEncryptionPolicy) {
            this.createMacDiskEncryptionPolicy(macOs.diskEncryptionPolicy);
        }
        if (macOs.firewallPolicy) {
            this.createMacFirewallPolicy(macOs.firewallPolicy);
        }
        if (macOs.importCustomConfigs) {
            this.importMacCustomConfigs(macOs.importCustomConfigs);
        }
    }

    /**This need to be an Intune Administrator.*/
    private createPlatformRestrictions() {
        const {intuneId, macOs} = this.args;
        if (!intuneId) return undefined;

        return new DefaultPlatformRestrictionsResource(`${this.name}-default-platform-restrictions`, {
            intuneId,
            macosRestriction: macOs ? {
                platformBlocked: false,
                personalDeviceEnrollmentBlocked: true,
            } : undefined
        }, {parent: this});
    }

    private createCorporateDeviceIdentifiers() {
        const {corporateDeviceIdentifiers} = this.args;
        if (!corporateDeviceIdentifiers || corporateDeviceIdentifiers.length <= 0) return undefined;

        return new CorporateDeviceIdentifiersResource(`${this.name}-corporate-device-identifiers`, {identifiers: corporateDeviceIdentifiers}, {parent: this});
    }
}