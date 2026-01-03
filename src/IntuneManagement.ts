import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {MacCompliancePolicyInputs, MacCompliancePolicyResource} from "./devices/MacCompliancePolicy";
import * as types from "./types";
import {
    CompliancePolicyAssignmentInputs,
    CompliancePolicyAssignmentResource
} from "./devices/CompliancePolicyAssignment";

export interface IntuneManagementArgs {
    compliancePolices?: {
        macOs?: types.AsInput<MacCompliancePolicyInputs> & {
            assignments?: types.AsInput<Omit<CompliancePolicyAssignmentInputs, 'compliancePolicyId'>>
        }
    }
}

export class IntuneManagement extends BaseComponent<IntuneManagementArgs> {
    constructor(name: string, args: IntuneManagementArgs, opts?: pulumi.ComponentResourceOptions) {
        super('IntuneManagement', name, args, opts);
        this.createDevicePolicies();
    }

    public getOutputs(): pulumi.Inputs | pulumi.Output<pulumi.Inputs> {
        return {};
    }

    private createDevicePolicies() {
        const {compliancePolices} = this.args;
        if (compliancePolices?.macOs) {
            const {assignments, ...others} = compliancePolices.macOs;
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
    }
}