import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
    ConfigurationPolicyAssignmentInputs,
    ConfigurationPolicyAssignmentResource,
    CustomPolicyResource,
    deviceHelpers
} from './devices';
import * as types from './types';
import {DeviceConfiguration} from "./DeviceConfiguration";
import {CustomConfiguration, CustomTrustedCertificate} from "./devices/types";

export interface DeviceCustomConfigurationImporterArgs extends deviceHelpers.DirectoryMacConfigsImporterArgs {
    assignments: types.AsInput<Omit<ConfigurationPolicyAssignmentInputs, 'configPolicyId' | 'configType'>>;
}

export class DeviceCustomConfigurationImporter extends BaseComponent<DeviceCustomConfigurationImporterArgs> {
    public readonly results: types.ResourceOutputs[];

    constructor(name: string, args: DeviceCustomConfigurationImporterArgs, opts?: pulumi.ComponentResourceOptions) {
        super('DeviceCustomConfigurationImporter', name, args, opts);

        const {assignments, ...config} = args;
        const configs = deviceHelpers.createMacConfigs(config);

        const results = configs.map((config) => this.createDynamicConfig(config));

        this.results = results.map((s) => ({
            id: s.id!,
            resourceName: pulumi.output(s.name),
        }));
    }

    public getOutputs(): pulumi.Inputs | pulumi.Output<pulumi.Inputs> {
        return {results: this.results};
    }

    private createDynamicConfig(args: deviceHelpers.DirectoryMacConfigsImporterOutputs) {
        const {assignments} = this.args;

        if (args.type === 'DeviceConfiguration')
            return new DeviceConfiguration(`${this.name}-${args.name.replace(/\s+/g, '').toLowerCase()}`, {
                ...args.config,
                assignments
            }, {parent: this});

        return this.createCustomConfig(args.name, args.config);
    }

    private createCustomConfig(name: string, config: CustomConfiguration | CustomTrustedCertificate) {
        const {assignments} = this.args;

        const policy = new CustomPolicyResource(`${this.name}-${name.replace(/\s+/g, '').toLowerCase()}-config`, {
            config,
        }, {...this.opts, parent: this});

        if (assignments) {
            new ConfigurationPolicyAssignmentResource(`${this.name}-${name.replace(/\s+/g, '').toLowerCase()}-assignment`, {
                ...assignments,
                configPolicyId: policy.id,
                configType: 'deviceConfigurations'
            }, {
                dependsOn: policy, deletedWith: policy, parent: this
            });
        }

        return policy;
    }
}
