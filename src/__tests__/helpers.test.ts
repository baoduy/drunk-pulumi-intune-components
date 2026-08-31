jest.mock('@azure/identity', () => ({
    ClientSecretCredential: jest.fn().mockImplementation(() => ({
        getToken: jest.fn().mockResolvedValue({token: 'fake-token'}),
    })),
}));

process.env.AZURE_TENANT_ID = 'tenant';
process.env.AZURE_CLIENT_ID = 'client';
process.env.AZURE_CLIENT_SECRET = 'secret';

import {graphRequest, deleteOrWarn} from '../helpers';

describe('graphRequest', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('returns parsed JSON body when the Graph call succeeds', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => JSON.stringify({id: 'abc-123'}),
        }) as any;

        const result = await graphRequest('beta/deviceManagement/deviceCategories', 'GET');

        expect(result).toEqual({id: 'abc-123'});
    });

    it('returns the raw text when the Graph body is not valid JSON', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => 'not-json',
        }) as any;

        const result = await graphRequest('beta/deviceManagement/deviceCategories', 'GET');

        expect(result).toBe('not-json');
    });

    it('throws an Error with the HTTP status attached when the Graph call fails', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            text: async () => 'resource missing',
        }) as any;

        await expect(graphRequest('beta/deviceManagement/deviceCategories/x', 'DELETE')).rejects.toMatchObject({
            status: 404,
        });
    });
});

describe('deleteOrWarn', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('resolves without logging when the delete action succeeds', async () => {
        await expect(deleteOrWarn('deviceCategories', 'cat-1', () => Promise.resolve())).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('resolves silently (no log) when the delete action fails with a 404 — already gone', async () => {
        const notFound: any = new Error('gone');
        notFound.status = 404;

        await expect(deleteOrWarn('deviceCategories', 'cat-1', () => Promise.reject(notFound))).resolves.toBeUndefined();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('resolves (never rejects) and logs exactly one actionable line when the delete action fails for any other reason', async () => {
        const serverError: any = new Error('boom');
        serverError.status = 500;

        await expect(deleteOrWarn('deviceCategories', 'cat-1', () => Promise.reject(serverError))).resolves.toBeUndefined();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        const loggedMessage = consoleErrorSpy.mock.calls[0][0] as string;
        expect(loggedMessage).toContain('deviceCategories');
        expect(loggedMessage).toContain('cat-1');
        expect(loggedMessage).toContain('delete it manually');
    });
});
