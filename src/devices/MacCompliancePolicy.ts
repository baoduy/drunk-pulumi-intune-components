import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import {deviceHelpers} from './index';
import {MacDeviceCompliance} from './types';
import * as types from '../types';

export interface MacCompliancePolicyInputs
    extends Omit<
        MacDeviceCompliance,
        'id' | 'roleScopeTagIds' | 'scheduledActionsForRule' | '@odata.type' | 'assignments'
    > {
    scheduledActions?: {
        markDeviceNoncompliantDays?: number;
        remotelyLockNoncompliantDeviceDays?: number;
    };
}

export interface MacCompliancePolicyOutputs extends MacCompliancePolicyInputs {
}

class MacCompliancePolicyProvider extends BaseProvider<MacCompliancePolicyInputs, MacCompliancePolicyOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: MacCompliancePolicyInputs): Promise<pulumi.dynamic.CreateResult> {
        const rs = await graphRequest(
            `beta/deviceManagement/deviceCompliancePolicies`,
            'POST',
            deviceHelpers.createMacCompliancePayload(inputs),
        ).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });
        return {id: rs.id!, outs: inputs};
    }

    public async update(
        id: string,
        olds: MacCompliancePolicyInputs,
        news: MacCompliancePolicyInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        //Get current payload
        const current = await graphRequest(`beta/deviceManagement/deviceCompliancePolicies/${id}`, 'GET');
        const {scheduledActionsForRule} = deviceHelpers.createMacCompliancePayload(news);
        //Update Schedule Actions
        await graphRequest(`beta/deviceManagement/deviceCompliancePolicies/${id}/scheduleActionsForRules`, 'POST', {
            deviceComplianceScheduledActionForRules: scheduledActionsForRule,
        }).catch((error) => {
            console.error('scheduleActionsForRules', error);
            throw error;
        });

        //Update policy without schedule actions
        await graphRequest(`beta/deviceManagement/deviceCompliancePolicies/${id}`, 'PATCH', {
            ...current,
            ...news,
            'assignments@odata.context': `https://graph.microsoft.com/beta/$metadata#deviceManagement/deviceCompliancePolicies('${id}')/microsoft.graph.macOSCompliancePolicy/assignments`,
            'scheduledActionsForRule@odata.context': `https://graph.microsoft.com/beta/$metadata#deviceManagement/deviceCompliancePolicies('${id}')/microsoft.graph.macOSCompliancePolicy/scheduledActionsForRule(scheduledActionConfigurations())`,
        }).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });

        return {outs: news};
    }

    public async delete(id: string, props: MacCompliancePolicyInputs): Promise<void> {
        await graphRequest(`beta/deviceManagement/deviceCompliancePolicies/${id}`, 'DELETE')
            .catch(error => console.error('deviceCompliancePolicies', error));
    }
}

export class MacCompliancePolicyResource extends BaseResource<MacCompliancePolicyInputs, MacCompliancePolicyOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<MacCompliancePolicyInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new MacCompliancePolicyProvider(name), `drunk:intune:MacCompliancePolicy:${name}`, props, opts);
        this.name = name;
    }
}
