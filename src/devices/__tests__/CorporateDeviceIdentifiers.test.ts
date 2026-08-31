jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import {graphRequest} from '../../helpers';
import {CorporateDeviceIdentifiersProvider} from '../CorporateDeviceIdentifiers';

const mockGraphRequest = graphRequest as jest.Mock;

const identifiers = [
    {importedDeviceIdentityType: 'serialNumber' as const, importedDeviceIdentifier: 'SN-1', platform: 'macOS' as const},
];

describe('CorporateDeviceIdentifiersProvider', () => {
    beforeEach(() => {
        mockGraphRequest.mockReset();
    });

    it('create resolves with the provider name as id when the Graph import succeeds', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new CorporateDeviceIdentifiersProvider('test');

        const result = await provider.create({identifiers} as any);

        expect(result).toEqual({id: 'test', outs: {identifiers}});
        expect(mockGraphRequest).toHaveBeenCalledWith(
            'beta/deviceManagement/importedDeviceIdentities/importDeviceIdentityList',
            'POST',
            {overwriteImportedDeviceIdentities: true, importedDeviceIdentities: identifiers},
        );
    });

    it('create rejects when the Graph import fails', async () => {
        mockGraphRequest.mockRejectedValue(new Error('import failed'));
        const provider = new CorporateDeviceIdentifiersProvider('test');

        await expect(provider.create({identifiers} as any)).rejects.toThrow('import failed');
    });

    it('update delegates to create with the new inputs', async () => {
        mockGraphRequest.mockResolvedValue({});
        const provider = new CorporateDeviceIdentifiersProvider('test');

        const result = await provider.update('test', {identifiers: []} as any, {identifiers} as any);

        expect(result).toEqual({id: 'test', outs: {identifiers}});
    });

    it('delete resolves and issues no Graph call — deliberate no-op, $batch teardown never verified (DRK-778)', async () => {
        const provider = new CorporateDeviceIdentifiersProvider('test');

        await expect(provider.delete('test', {identifiers} as any)).resolves.toBeUndefined();

        expect(mockGraphRequest).not.toHaveBeenCalled();
    });
});
