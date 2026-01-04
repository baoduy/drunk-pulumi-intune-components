import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
    ConfigurationPolicyAssignmentInputs,
    ConfigurationPolicyAssignmentResource,
    CustomPolicyResource,
} from "./devices";
import deviceHelpers, {CustomConfigArgs} from "./devices/helpers";
import * as types from "./types";

export interface DeviceCustomConfigurationArgs extends CustomConfigArgs {
    assignments: types.AsInput<Omit<ConfigurationPolicyAssignmentInputs, 'configPolicyId' | 'configType'>>
}

export class DeviceCustomConfiguration extends BaseComponent<DeviceCustomConfigurationArgs> {
    public readonly id?: pulumi.Output<string>;

    constructor(name: string, args: DeviceCustomConfigurationArgs, opts?: pulumi.ComponentResourceOptions) {
        super('DeviceCustomConfiguration', name, args, opts);

        const {assignments, ...config} = args;
        const policy = new CustomPolicyResource(`${this.name}-config`, {
            config: deviceHelpers.createMacCustomConfig(config),
        }, {...this.opts, parent: this});

        if (assignments) {
            new ConfigurationPolicyAssignmentResource(`${this.name}-assignment`, {
                ...assignments,
                configPolicyId: policy.id,
                configType: 'deviceConfigurations'
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