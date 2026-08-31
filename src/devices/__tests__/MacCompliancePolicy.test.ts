jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {MacCompliancePolicyProvider} from '../MacCompliancePolicy';

const mockGraphRequest = graphRequest as jest.Mock;

describe('MacCompliancePolicyProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves with the Graph-issued id when the Graph POST succeeds', async () => {
        mockGraphRequest.mockResolvedValue({id: 'mac-1'});
        const provider = new MacCompliancePolicyProvider('test');

        const result = await provider.create({});

        expect(result).toEqual({id: 'mac-1', outs: {}});
    });

    it('create rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('create failed'));
        const provider = new MacCompliancePolicyProvider('test');

        await expect(provider.create({})).rejects.toThrow('create failed');
    });

    it('update resolves with the new inputs when the GET, schedule-actions POST, and PATCH all succeed', async () => {
        mockGraphRequest
            .mockResolvedValueOnce({displayName: 'current'}) // GET current
            .mockResolvedValueOnce({}) // POST scheduleActionsForRules
            .mockResolvedValueOnce({}); // PATCH policy
        const provider = new MacCompliancePolicyProvider('test');

        const result = await provider.update('mac-1', {}, {});

        expect(result).toEqual({outs: {}});
        expect(mockGraphRequest).toHaveBeenCalledTimes(3);
    });

    it('update rejects when the schedule-actions POST fails', async () => {
        mockGraphRequest
            .mockResolvedValueOnce({displayName: 'current'})
            .mockRejectedValueOnce(new Error('schedule actions failed'));
        const provider = new MacCompliancePolicyProvider('test');

        await expect(provider.update('mac-1', {}, {})).rejects.toThrow('schedule actions failed');
    });

    it('update rejects when the final PATCH fails', async () => {
        mockGraphRequest
            .mockResolvedValueOnce({displayName: 'current'})
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('patch failed'));
        const provider = new MacCompliancePolicyProvider('test');

        await expect(provider.update('mac-1', {}, {})).rejects.toThrow('patch failed');
    });

    it('delete resolves (never rejects) and logs one actionable line when the Graph DELETE fails', async () => {
        const failure: any = new Error('delete failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new MacCompliancePolicyProvider('test');

        await expect(provider.delete('mac-1', {})).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceCompliancePolicies');
        expect(loggedMessage).toContain('mac-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the Graph DELETE 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new MacCompliancePolicyProvider('test');

        await expect(provider.delete('mac-1', {})).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
