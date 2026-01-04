import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import * as types from '../types';
import {CustomConfiguration, CustomTrustedCertificate} from "./types";

export interface CustomPolicyInputs {
    config: CustomConfiguration | CustomTrustedCertificate
}

export interface CustomPolicyOutputs extends CustomPolicyInputs {
}

class CustomPolicyProvider extends BaseProvider<CustomPolicyInputs, CustomPolicyOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: CustomPolicyInputs): Promise<pulumi.dynamic.CreateResult> {
        const rs = await graphRequest(
            `beta/deviceManagement/deviceConfigurations`,
            'POST',
            inputs.config,
        ).catch((error) => {
            console.error('deviceConfigurations', error);
            throw error;
        });

        return {id: rs.id, outs: inputs};
    }

    public async update(
        id: string,
        olds: CustomPolicyInputs,
        news: CustomPolicyInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        await graphRequest(
            `beta/deviceManagement/deviceConfigurations/${id}`,
            'PATCH',
            news.config,
        ).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });

        return {outs: news};
    }

    public async delete(id: string, props: CustomPolicyOutputs): Promise<void> {
        await graphRequest(`beta/deviceManagement/deviceConfigurations/${id}`, 'DELETE');
    }
}

export class CustomPolicyResource extends BaseResource<CustomPolicyInputs, CustomPolicyOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<CustomPolicyInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new CustomPolicyProvider(name), `drunk:intune:CustomPolicy:${name}`, props, opts);
        this.name = name;
    }
}
