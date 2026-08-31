jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {ConfigurationPolicyProvider} from '../ConfigurationPolicy';

const mockGraphRequest = graphRequest as jest.Mock;

describe('ConfigurationPolicyProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves with the Graph-issued id when the Graph POST succeeds', async () => {
        mockGraphRequest.mockResolvedValue({id: 'policy-1'});
        const provider = new ConfigurationPolicyProvider('test');

        const result = await provider.create({});

        expect(result).toEqual({id: 'policy-1', outs: {}});
    });

    it('create rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('create failed'));
        const provider = new ConfigurationPolicyProvider('test');

        await expect(provider.create({})).rejects.toThrow('create failed');
    });

    it('update rejects when the Graph PUT fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('update failed'));
        const provider = new ConfigurationPolicyProvider('test');

        await expect(provider.update('policy-1', {}, {})).rejects.toThrow('update failed');
    });

    it('delete resolves (never rejects) and logs one actionable line when the Graph DELETE fails', async () => {
        const failure: any = new Error('delete failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new ConfigurationPolicyProvider('test');

        await expect(provider.delete('policy-1', {})).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('configurationPolicies');
        expect(loggedMessage).toContain('policy-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the Graph DELETE 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new ConfigurationPolicyProvider('test');

        await expect(provider.delete('policy-1', {})).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
