jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import * as pulumi from '@pulumi/pulumi';
import {graphRequest} from '../../helpers';
import {ConfigurationPolicyAssignmentProvider, ConfigurationPolicyAssignmentResource} from '../ConfigurationPolicyAssignment';

const mockGraphRequest = graphRequest as jest.Mock;

pulumi.runtime.setMocks({
    newResource: (args: pulumi.runtime.MockResourceArgs) => ({id: `${args.name}-id`, state: args.inputs}),
    call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
});

describe('ConfigurationPolicyAssignmentProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create posts to the configurationPolicies assign path for that configType', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await provider.create({configPolicyId: 'policy-1', configType: 'configurationPolicies', allUsers: true});

        expect(mockGraphRequest).toHaveBeenCalledWith(
            "beta/deviceManagement/configurationPolicies('policy-1')/assign",
            'POST',
            expect.any(Object),
        );
    });

    it('create posts to the deviceConfigurations assign path for that configType', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await provider.create({configPolicyId: 'policy-2', configType: 'deviceConfigurations', allDevices: true});

        expect(mockGraphRequest).toHaveBeenCalledWith(
            'beta/deviceManagement/deviceConfigurations/policy-2/assign',
            'POST',
            expect.any(Object),
        );
    });

    it('create builds direct-target assignments from includeGroupIds', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await provider.create({
            configPolicyId: 'policy-1',
            configType: 'configurationPolicies',
            includeGroupIds: ['group-a', 'group-b'],
        });

        expect(mockGraphRequest).toHaveBeenCalledWith(
            "beta/deviceManagement/configurationPolicies('policy-1')/assign",
            'POST',
            {
                assignments: [
                    {source: 'direct', target: {groupId: 'group-a', '@odata.type': '#microsoft.graph.groupAssignmentTarget', deviceAndAppManagementAssignmentFilterType: 'none'}},
                    {source: 'direct', target: {groupId: 'group-b', '@odata.type': '#microsoft.graph.groupAssignmentTarget', deviceAndAppManagementAssignmentFilterType: 'none'}},
                ],
            },
        );
    });

    it('create appends exclusion-target assignments from excludeGroupIds', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await provider.create({
            configPolicyId: 'policy-1',
            configType: 'configurationPolicies',
            allUsers: true,
            excludeGroupIds: ['group-x'],
        });

        const [, , payload] = mockGraphRequest.mock.calls[0];
        expect(payload.assignments).toContainEqual({
            source: 'direct',
            target: {groupId: 'group-x', '@odata.type': '#microsoft.graph.exclusionGroupAssignmentTarget', deviceAndAppManagementAssignmentFilterType: 'none'},
        });
    });

    it('create rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('assign failed'));
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await expect(
            provider.create({configPolicyId: 'policy-1', configType: 'configurationPolicies', allUsers: true}),
        ).rejects.toThrow('assign failed');
    });

    it('update (re-assign) rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('reassign failed'));
        const provider = new ConfigurationPolicyAssignmentProvider('test');
        const inputs = {configPolicyId: 'policy-1', configType: 'configurationPolicies' as const, allUsers: true};

        await expect(provider.update('assignment-1', inputs, inputs)).rejects.toThrow('reassign failed');
    });

    it('delete unassigns by props.configPolicyId, not by the Pulumi resource id', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await provider.delete('some-unrelated-pulumi-id', {configPolicyId: 'policy-1', configType: 'configurationPolicies'});

        expect(mockGraphRequest).toHaveBeenCalledWith(
            "beta/deviceManagement/configurationPolicies('policy-1')/assign",
            'POST',
            {assignments: []},
        );
    });

    it('delete resolves (never rejects) and logs one actionable line when the unassign call fails', async () => {
        const failure: any = new Error('unassign failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await expect(
            provider.delete('some-pulumi-id', {configPolicyId: 'policy-1', configType: 'deviceConfigurations'}),
        ).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceConfigurations assignment');
        expect(loggedMessage).toContain('policy-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the unassign call 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new ConfigurationPolicyAssignmentProvider('test');

        await expect(
            provider.delete('some-pulumi-id', {configPolicyId: 'policy-1', configType: 'deviceConfigurations'}),
        ).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('wires its provider through the pulumi.dynamic.Resource wrapper', async () => {
        mockGraphRequest.mockResolvedValue({});
        const resource = new ConfigurationPolicyAssignmentResource('my-assignment', {
            configPolicyId: 'policy-1',
            configType: 'configurationPolicies',
            allUsers: true,
        });

        await expect(new Promise((resolve) => resource.urn.apply(resolve))).resolves.toContain(
            'drunk:intune:ConfigurationPolicyAssignment',
        );
    });
});
