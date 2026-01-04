import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import {DeviceConfigurationPolicy} from "./types";
import * as types from '../types';

export interface ConfigurationPolicyInputs
    extends Omit<DeviceConfigurationPolicy, 'id'> {
}

export interface ConfigurationPolicyOutputs extends ConfigurationPolicyInputs {
}

class ConfigurationPolicyProvider extends BaseProvider<ConfigurationPolicyInputs, ConfigurationPolicyOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: ConfigurationPolicyInputs): Promise<pulumi.dynamic.CreateResult> {
        const rs = await graphRequest(
            'beta/deviceManagement/configurationPolicies',
            'POST',
            inputs,
        ).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });
        return {id: rs.id!, outs: inputs};
    }

    public async update(
        id: string,
        olds: ConfigurationPolicyInputs,
        news: ConfigurationPolicyInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        //Update policy without schedule actions
        await graphRequest(`beta/deviceManagement/configurationPolicies('${id}')`, 'PUT', news).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });

        return {outs: news};
    }

    public async delete(id: string, props: ConfigurationPolicyInputs): Promise<void> {
        await graphRequest(`beta/deviceManagement/configurationPolicies('${id}')`, 'DELETE');
    }
}

export class ConfigurationPolicyResource extends BaseResource<ConfigurationPolicyInputs, ConfigurationPolicyOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<ConfigurationPolicyInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new ConfigurationPolicyProvider(name), `drunk:intune:ConfigurationPolicy:${name}`, props, opts);
        this.name = name;
    }
}
