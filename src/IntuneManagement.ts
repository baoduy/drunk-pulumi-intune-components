import {BaseComponent} from './base';
import * as pulumi from '@pulumi/pulumi';
import {MacCompliancePolicyInputs, MacCompliancePolicyResource} from "./devices/MacCompliancePolicy";
import * as types from "./types";

export interface IntuneManagementArgs {
    compliancePolices?: {
        macOs?: types.AsInput<MacCompliancePolicyInputs>
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
            const policy = new MacCompliancePolicyResource(`${this.name}-compliance-policy`, compliancePolices.macOs, {
                ...this.opts,
                parent: this
            });
        }
    }
}