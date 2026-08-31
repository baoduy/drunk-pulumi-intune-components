jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {CustomPolicyProvider} from '../CustomPolicy';

const mockGraphRequest = graphRequest as jest.Mock;

describe('CustomPolicyProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves with the Graph-issued id when the Graph POST succeeds', async () => {
        mockGraphRequest.mockResolvedValue({id: 'config-1'});
        const provider = new CustomPolicyProvider('test');

        const result = await provider.create({config: {}});

        expect(result).toEqual({id: 'config-1', outs: {config: {}}});
    });

    it('create rejects when the Graph POST fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('create failed'));
        const provider = new CustomPolicyProvider('test');

        await expect(provider.create({config: {}})).rejects.toThrow('create failed');
    });

    it('update rejects when the Graph PATCH fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('update failed'));
        const provider = new CustomPolicyProvider('test');

        await expect(provider.update('config-1', {config: {}}, {config: {}})).rejects.toThrow('update failed');
    });

    it('delete resolves (never rejects) and logs one actionable line when the Graph DELETE fails', async () => {
        const failure: any = new Error('delete failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new CustomPolicyProvider('test');

        await expect(provider.delete('config-1', {config: {}})).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceConfigurations');
        expect(loggedMessage).toContain('config-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the Graph DELETE 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new CustomPolicyProvider('test');

        await expect(provider.delete('config-1', {config: {}})).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
});
