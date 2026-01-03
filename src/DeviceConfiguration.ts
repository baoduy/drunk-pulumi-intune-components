import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
    CompliancePolicyAssignmentInputs,
    ConfigurationPolicyAssignmentResource,
    ConfigurationPolicyInputs,
    ConfigurationPolicyResource
} from "./devices";
import * as types from "./types";

export interface DeviceConfigurationArgs extends ConfigurationPolicyInputs {
    assignments: types.AsInput<Omit<CompliancePolicyAssignmentInputs, 'compliancePolicyId'>>
};


export class DeviceConfiguration extends BaseComponent<DeviceConfigurationArgs> {
    public readonly id?: pulumi.Output<string>;

    constructor(name: string, args: DeviceConfigurationArgs, opts?: pulumi.ComponentResourceOptions) {
        super('DeviceConfiguration', name, args, opts);

        const {assignments, ...props} = args;
        const policy = new ConfigurationPolicyResource(`${this.name}-policy`, {
            ...props
        }, {...this.opts, parent: this});

        if (assignments) {
            new ConfigurationPolicyAssignmentResource(`${this.name}-assignment`, {
                ...assignments,
                configPolicyId: policy.id
            }, {
                dependsOn: policy, deletedWith: policy, parent: this
            });
        }

        this.id = policy.id;
    }

    public getOutputs(): pulumi.Inputs | pulumi.Output<pulumi.Inputs> {
        return {id: this.id};
    }
}