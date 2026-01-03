import * as pulumi from '@pulumi/pulumi';
import {BaseOptions, BaseProvider, BaseResource} from '../base';
import {createDeviceClient} from '../helpers';
import {createMacCompliancePayload} from './helpers';
import {MacDeviceCompliance} from "./types";


export interface MacCompliancePolicyInputs extends Omit<MacDeviceCompliance, 'roleScopeTagIds' | 'scheduledActionsForRule'|'@odata.type'> {
  scheduledActions?: {
    markDeviceNoncompliantHours?: number;
    remotelyLockNoncompliantDeviceHours?: number;
  };
}

export interface MacCompliancePolicyOutputs extends MacCompliancePolicyInputs {}

class MacCompliancePolicyProvider extends BaseProvider<MacCompliancePolicyInputs, MacCompliancePolicyOutputs> {
  constructor(private name: string) {
    super();
  }

  public async create(inputs: MacCompliancePolicyInputs): Promise<pulumi.dynamic.CreateResult> {
    const rs =await graphRequest(`/deviceManagement/deviceCompliancePolicies`,'POST', createMacCompliancePayload(inputs));
    return { id: rs.id!, outs: inputs };
  }

  public async update(
    id: string,
    olds: MacCompliancePolicyInputs,
    news: MacCompliancePolicyInputs,
  ): Promise<pulumi.dynamic.UpdateResult> {
      const rs =await graphRequest(`/deviceManagement/deviceCompliancePolicies`,'PATCH', createMacCompliancePayload(inputs));

    return { outs: news };
  }
}

export class MacCompliancePolicyResource extends BaseResource<MacCompliancePolicyInputs, MacCompliancePolicyOutputs> {
  declare readonly name: string;

  constructor(name: string, props: BaseOptions<MacCompliancePolicyInputs>, opts?: pulumi.CustomResourceOptions) {
    super(new MacCompliancePolicyProvider(name), `drunk:intune:MacCompliancePolicy:${name}`, props, opts);
    this.name = name;
  }
}
