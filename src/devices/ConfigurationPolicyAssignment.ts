import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import * as types from '../types';

export interface ConfigurationPolicyAssignmentInputs {
    configPolicyId: string;
    configType: 'deviceConfigurations' | 'configurationPolicies',
    includeGroupIds?: string[];
    excludeGroupIds?: string[];
    allUsers?: boolean;
    allDevices?: boolean;
}

export interface ConfigurationPolicyAssignmentOutputs extends ConfigurationPolicyAssignmentInputs {
}

class ConfigurationPolicyAssignmentProvider extends BaseProvider<ConfigurationPolicyAssignmentInputs, ConfigurationPolicyAssignmentOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: ConfigurationPolicyAssignmentInputs): Promise<pulumi.dynamic.CreateResult> {
        const payload = {
            "assignments": new Array<any>()
        };
        if (inputs.allUsers || inputs.allDevices) {
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
        } else {
            if (inputs.includeGroupIds) {
                inputs.includeGroupIds.forEach((id: string) => payload.assignments.push({
                    "source": "direct",
                    "target": {
                        "groupId": id,
                        "@odata.type": "#microsoft.graph.groupAssignmentTarget",
                        "deviceAndAppManagementAssignmentFilterType": "none"
                    }
                }));
            }
        }
        if (inputs.excludeGroupIds) {
            inputs.excludeGroupIds.forEach((id: string) => payload.assignments.push({
                "source": "direct",
                "target": {
                    "groupId": id,
                    "@odata.type": "#microsoft.graph.exclusionGroupAssignmentTarget",
                    "deviceAndAppManagementAssignmentFilterType": "none"
                }
            }));
        }

        await graphRequest(this.getPath(inputs),
            'POST',
            payload,
        ).catch((error) => {
            console.error(inputs.configType, error);
            throw error;
        });
        return {id: this.name, outs: inputs};
    }

    public async update(
        id: string,
        olds: ConfigurationPolicyAssignmentInputs,
        news: ConfigurationPolicyAssignmentInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        return this.create(news);
    }

    private getPath(inputs: ConfigurationPolicyAssignmentInputs): string {
        return inputs.configType === 'configurationPolicies'
            ? `beta/deviceManagement/configurationPolicies('${inputs.configPolicyId}')/assign`
            : `beta/deviceManagement/deviceConfigurations/${inputs.configPolicyId}/assign`
    }
}

export class ConfigurationPolicyAssignmentResource extends BaseResource<ConfigurationPolicyAssignmentInputs, ConfigurationPolicyAssignmentOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<ConfigurationPolicyAssignmentInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new ConfigurationPolicyAssignmentProvider(name), `drunk:intune:ConfigurationPolicyAssignment:${name}`, props, opts);
        this.name = name;
    }
}
