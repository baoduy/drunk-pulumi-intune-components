import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import * as types from '../types';

export interface CompliancePolicyAssignmentInputs {
    compliancePolicyId: string;
    groupId?: string;
    allUsers?: boolean;
    allDevices?: boolean;
}

export interface CompliancePolicyAssignmentOutputs extends CompliancePolicyAssignmentInputs {
}

class CompliancePolicyAssignmentProvider extends BaseProvider<CompliancePolicyAssignmentInputs, CompliancePolicyAssignmentOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: CompliancePolicyAssignmentInputs): Promise<pulumi.dynamic.CreateResult> {
        const payload = {
            "assignments": new Array<any>()
        };

        if (inputs.groupId) {
            payload.assignments.push({
                "target": {
                    "@odata.type": "#microsoft.graph.groupAssignmentTarget",
                    "groupId": inputs.groupId,
                }
            })
        } else {
            if (inputs.allUsers) {
                payload.assignments.push({
                    "target": {
                        "@odata.type": "#microsoft.graph.allLicensedUsersAssignmentTarget"
                    }
                });
            }
            if (inputs.allDevices) {
                payload.assignments.push({
                    "target": {
                        "@odata.type": "#microsoft.graph.allDevicesAssignmentTarget"
                    }
                });
            }
        }

        await graphRequest(
            `beta/deviceManagement/deviceCompliancePolicies/${inputs.compliancePolicyId}/assign`,
            'POST',
            payload,
        ).catch((error) => {
            console.error('deviceCompliancePolicies', error);
            throw error;
        });
        return {id: this.name, outs: inputs};
    }

    public async update(
        id: string,
        olds: CompliancePolicyAssignmentInputs,
        news: CompliancePolicyAssignmentInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        return this.create(news);
    }
}

export class CompliancePolicyAssignmentResource extends BaseResource<CompliancePolicyAssignmentInputs, CompliancePolicyAssignmentOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<CompliancePolicyAssignmentInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new CompliancePolicyAssignmentProvider(name), `drunk:intune:CompliancePolicyAssignment:${name}`, props, opts);
        this.name = name;
    }
}
