import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {
  ConfigurationPolicyAssignmentInputs,
  ConfigurationPolicyAssignmentResource,
  CustomPolicyResource,
} from './devices';
import deviceHelpers, {DirectoryMacConfigsImporterArgs} from './devices/helpers';
import * as types from './types';
import {CustomConfiguration, CustomTrustedCertificate} from "./devices/types";

export interface DeviceCustomConfigurationImporterArgs extends DirectoryMacConfigsImporterArgs {
    assignments: types.AsInput<Omit<ConfigurationPolicyAssignmentInputs, 'configPolicyId' | 'configType'>>;
}

export class DeviceCustomConfigurationImporter extends BaseComponent<DeviceCustomConfigurationImporterArgs> {
    public readonly results: types.ResourceOutputs[];

    constructor(name: string, args: DeviceCustomConfigurationImporterArgs, opts?: pulumi.ComponentResourceOptions) {
        super('DeviceCustomConfigurationImporter', name, args, opts);

        const {assignments, ...config} = args;
        const configs = deviceHelpers.createMacConfigs(config);

        const results = configs.map((config, index) => this.createCustomConfig(config));

        this.results = results.map(s => ({
            id: s.id,
            resourceName: pulumi.output(s.name)
        }));
    }

    public getOutputs(): pulumi.Inputs | pulumi.Output<pulumi.Inputs> {
        return {results: this.results};
    }

    private createCustomConfig(args: CustomConfiguration | CustomTrustedCertificate) {
        const {assignments} = this.args;

        const policy = new CustomPolicyResource(
            `${this.name}-${args.displayName}-config`,
            {
                config: args,
            },
            {...this.opts, parent: this},
        );

        if (assignments) {
            new ConfigurationPolicyAssignmentResource(
                `${this.name}-${args.displayName}-assignment`,
                {
                    ...assignments,
                    configPolicyId: policy.id,
                    configType: 'deviceConfigurations',
                },
                {
                    dependsOn: policy,
                    deletedWith: policy,
                    parent: this,
                },
            );
        }

        return policy;
    }
}
