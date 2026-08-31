jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {CompliancePolicyAssignmentProvider} from '../CompliancePolicyAssignment';

const mockGraphRequest = graphRequest as jest.Mock;

describe('CompliancePolicyAssignmentProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves and posts assignment targets built from groupId', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new CompliancePolicyAssignmentProvider('test');

        await provider.create({compliancePolicyId: 'policy-1', groupId: 'group-1'});

        expect(mockGraphRequest).toHaveBeenCalledWith(
            'beta/deviceManagement/deviceCompliancePolicies/policy-1/assign',
            'POST',
            {assignments: [{target: {'@odata.type': '#microsoft.graph.groupAssignmentTarget', groupId: 'group-1'}}]},
        );
    });

    it('create rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('assign failed'));
        const provider = new CompliancePolicyAssignmentProvider('test');

        await expect(provider.create({compliancePolicyId: 'policy-1', allUsers: true})).rejects.toThrow('assign failed');
    });

    it('update (re-assign) rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('reassign failed'));
        const provider = new CompliancePolicyAssignmentProvider('test');

        await expect(
            provider.update('assignment-1', {compliancePolicyId: 'policy-1'}, {compliancePolicyId: 'policy-1', allDevices: true}),
        ).rejects.toThrow('reassign failed');
    });

    it('delete unassigns by props.compliancePolicyId, not by the Pulumi resource id', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new CompliancePolicyAssignmentProvider('test');

        await provider.delete('some-unrelated-pulumi-id', {compliancePolicyId: 'policy-1'});

        expect(mockGraphRequest).toHaveBeenCalledWith(
            'beta/deviceManagement/deviceCompliancePolicies/policy-1/assign',
            'POST',
            {assignments: []},
        );
    });

    it('delete resolves (never rejects) and logs one actionable line when the unassign call fails', async () => {
        const failure: any = new Error('unassign failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new CompliancePolicyAssignmentProvider('test');

        await expect(provider.delete('some-pulumi-id', {compliancePolicyId: 'policy-1'})).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceCompliancePolicies assignment');
        expect(loggedMessage).toContain('policy-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the unassign call 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new CompliancePolicyAssignmentProvider('test');

        await expect(provider.delete('some-pulumi-id', {compliancePolicyId: 'policy-1'})).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
