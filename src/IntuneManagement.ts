import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
    CompliancePolicyAssignmentInputs,
    CompliancePolicyAssignmentResource,
    DefaultPlatformRestrictionsResource,
    deviceTypes,
    MacCompliancePolicyInputs,
    MacCompliancePolicyResource
} from "./devices";
import deviceHelpers, {MacDiskEncryptionPayloadArgs, MacFirewallConfigurationArgs} from "./devices/helpers";
import * as types from "./types";
import {DeviceConfiguration} from "./DeviceConfiguration";

type AssignmentType = { assignments: types.AsInput<Omit<CompliancePolicyAssignmentInputs, 'compliancePolicyId'>> };
type MacCompliancePolicyType = types.AsInput<MacCompliancePolicyInputs> & AssignmentType;
type ConfigurationPolicyType = deviceTypes.ConfigurationArgs & AssignmentType;

export interface IntuneManagementArgs {
    /** The Id of the Intune instance can be found when updating the DefaultPlatformRestrictions*/
    intuneId: pulumi.Input<string>;
    macOs?: {
        compliancePolicy: MacCompliancePolicyType;
        antiVirusPolicy: ConfigurationPolicyType;
        diskEncryptionPolicy: MacDiskEncryptionPayloadArgs & AssignmentType;
        firewallPolicy?: MacFirewallConfigurationArgs & AssignmentType;
    },
}

export class IntuneManagement extends BaseComponent<IntuneManagementArgs> {
    constructor(name: string, args: IntuneManagementArgs, opts?: pulumi.ComponentResourceOptions) {
        super('IntuneManagement', name, args, opts);

        this.createMacPolicies();
        //This need to be an Intune Administrator.
        //this.createPlatformRestrictions();
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
    }

    private createPlatformRestrictions() {
        const {intuneId, macOs} = this.args;
        return new DefaultPlatformRestrictionsResource(`${this.name}-default-platform-restrictions`, {
            intuneId,
            macosRestriction: macOs ? {
                platformBlocked: false,
                personalDeviceEnrollmentBlocked: true,
            } : undefined
        }, {parent: this});
    }
}