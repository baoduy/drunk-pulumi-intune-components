jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {DefaultPlatformRestrictionsProvider} from '../DefaultPlatformRestrictions';

const mockGraphRequest = graphRequest as jest.Mock;

const inputs = {intuneId: 'tenant-1', defaultDeviceLimit: 5};

describe('DefaultPlatformRestrictionsProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves with the provider name as id when both Graph PATCH calls succeed', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new DefaultPlatformRestrictionsProvider('test');

        const result = await provider.create(inputs);

        expect(result).toEqual({id: 'test', outs: inputs});
        expect(mockGraphRequest).toHaveBeenNthCalledWith(
            1,
            'beta/deviceManagement/deviceEnrollmentConfigurations/tenant-1_DefaultPlatformRestrictions',
            'PATCH',
            expect.any(Object),
        );
        expect(mockGraphRequest).toHaveBeenNthCalledWith(
            2,
            'beta/deviceManagement/deviceEnrollmentConfigurations/tenant-1_DefaultLimit',
            'PATCH',
            {'@odata.type': '#microsoft.graph.deviceEnrollmentLimitConfiguration', limit: 5},
        );
    });

    it('create rejects and never issues the device-limit PATCH when the restrictions PATCH fails', async () => {
        mockGraphRequest.mockRejectedValueOnce(new Error('restrictions failed'));
        const provider = new DefaultPlatformRestrictionsProvider('test');

        await expect(provider.create(inputs)).rejects.toThrow('restrictions failed');
        expect(mockGraphRequest).toHaveBeenCalledTimes(1);
    });

    it('create rejects when the device-limit PATCH fails after restrictions succeed', async () => {
        mockGraphRequest.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('limit failed'));
        const provider = new DefaultPlatformRestrictionsProvider('test');

        await expect(provider.create(inputs)).rejects.toThrow('limit failed');
        expect(mockGraphRequest).toHaveBeenCalledTimes(2);
    });

    it('defaults defaultDeviceLimit to 5 when not provided', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new DefaultPlatformRestrictionsProvider('test');

        await provider.create({intuneId: 'tenant-1'});

        expect(mockGraphRequest).toHaveBeenNthCalledWith(
            2,
            'beta/deviceManagement/deviceEnrollmentConfigurations/tenant-1_DefaultLimit',
            'PATCH',
            {'@odata.type': '#microsoft.graph.deviceEnrollmentLimitConfiguration', limit: 5},
        );
    });

    it('update delegates to create with the new inputs', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new DefaultPlatformRestrictionsProvider('test');

        const result = await provider.update('test', inputs, {...inputs, defaultDeviceLimit: 10});

        expect(result).toEqual({id: 'test', outs: {...inputs, defaultDeviceLimit: 10}});
    });
});
