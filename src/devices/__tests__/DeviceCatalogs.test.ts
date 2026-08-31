jest.mock('../../helpers', () => ({
    ...jest.requireActual('../../helpers'),
    graphRequest: jest.fn(),
}));

import * as pulumi from '@pulumi/pulumi';
import {graphRequest} from '../../helpers';
import {DeviceCatalogProvider, DeviceCatalogResource} from '../DeviceCatalogs';

const mockGraphRequest = graphRequest as jest.Mock;

pulumi.runtime.setMocks({
    newResource: (args: pulumi.runtime.MockResourceArgs) => ({id: `${args.name}-id`, state: args.inputs}),
    call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
});

// DeviceCatalogProvider.create swallows Graph failures without rethrowing and then
// dereferences the (now undefined) result — a known, out-of-scope bug (DRK-812).
// Only the happy path and delete's non-blocking behaviour are covered here.
describe('DeviceCatalogProvider', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        mockGraphRequest.mockReset();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('create resolves with the Graph-issued id when the Graph POST succeeds', async () => {
        mockGraphRequest.mockResolvedValue({id: 'catalog-1'});
        const provider = new DeviceCatalogProvider('test');

        const result = await provider.create({catalogName: 'Laptops'});

        expect(result).toEqual({id: 'catalog-1', outs: {catalogName: 'Laptops'}});
    });

    it('update is a no-op that always resolves with the new inputs', async () => {
        const provider = new DeviceCatalogProvider('test');

        const result = await provider.update('catalog-1', {catalogName: 'old'}, {catalogName: 'new'});

        expect(result).toEqual({outs: {catalogName: 'new'}});
        expect(mockGraphRequest).not.toHaveBeenCalled();
    });

    it('delete resolves (never rejects) and logs one actionable line when the Graph DELETE fails', async () => {
        const failure: any = new Error('delete failed');
        failure.status = 500;
        mockGraphRequest.mockRejectedValue(failure);
        const provider = new DeviceCatalogProvider('test');

        await expect(provider.delete('catalog-1', {catalogName: 'Laptops'})).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceCategories');
        expect(loggedMessage).toContain('catalog-1');
        expect(loggedMessage).toContain('delete it manually');
    });

    it('delete resolves silently when the Graph DELETE 404s — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;
        mockGraphRequest.mockRejectedValue(notFound);
        const provider = new DeviceCatalogProvider('test');

        await expect(provider.delete('catalog-1', {catalogName: 'Laptops'})).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('wires its provider through the pulumi.dynamic.Resource wrapper', async () => {
        mockGraphRequest.mockResolvedValue({id: 'catalog-1'});
        const resource = new DeviceCatalogResource('my-catalog', {catalogName: 'Laptops'});

        await expect(new Promise((resolve) => resource.urn.apply(resolve))).resolves.toContain(
            'drunk:intune:DeviceCatalog',
        );
    });
});
