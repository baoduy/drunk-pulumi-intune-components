jest.mock('@azure/identity', () => ({
    ClientSecretCredential: jest.fn().mockImplementation(() => ({
        getToken: jest.fn().mockResolvedValue({token: 'fake-token'}),
    })),
    DefaultAzureCredential: jest.fn().mockImplementation(() => ({
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

describe('credential selection (createCredential / getAzToken, exercised through graphRequest)', () => {
    const ENV_KEYS = [
        'INTUNE_AZURE_TENANT_ID',
        'INTUNE_AZURE_CLIENT_ID',
        'INTUNE_AZURE_CLIENT_SECRET',
        'AZURE_TENANT_ID',
        'AZURE_CLIENT_ID',
        'AZURE_CLIENT_SECRET',
    ];
    const savedEnv: Record<string, string | undefined> = {};
    const originalFetch = global.fetch;

    beforeEach(() => {
        ENV_KEYS.forEach(key => {
            savedEnv[key] = process.env[key];
            delete process.env[key];
        });
    });

    afterEach(() => {
        ENV_KEYS.forEach(key => {
            if (savedEnv[key] === undefined) delete process.env[key];
            else process.env[key] = savedEnv[key];
        });
        global.fetch = originalFetch;
    });

    // Resets the module registry so the module-private, memoised `credential`
    // is re-resolved for this test's env instead of leaking from a prior case.
    const loadHelpers = async (getTokenResult: {token: string} | null = {token: 'fake-token'}) => {
        jest.resetModules();
        const identity = require('@azure/identity');
        identity.ClientSecretCredential.mockReset().mockImplementation(() => ({
            getToken: jest.fn().mockResolvedValue(getTokenResult),
        }));
        identity.DefaultAzureCredential.mockReset().mockImplementation(() => ({
            getToken: jest.fn().mockResolvedValue(getTokenResult),
        }));
        global.fetch = jest.fn().mockResolvedValue({ok: true, status: 200, text: async () => ''}) as any;
        const helpers = require('../helpers');
        return {helpers, identity};
    };

    it('builds ClientSecretCredential from exactly the INTUNE_AZURE_* values when all three are set', async () => {
        process.env.INTUNE_AZURE_TENANT_ID = 'intune-tenant';
        process.env.INTUNE_AZURE_CLIENT_ID = 'intune-client';
        process.env.INTUNE_AZURE_CLIENT_SECRET = 'intune-secret';

        const {helpers, identity} = await loadHelpers();
        await helpers.graphRequest('beta/x', 'GET');

        expect(identity.ClientSecretCredential).toHaveBeenCalledTimes(1);
        expect(identity.ClientSecretCredential).toHaveBeenCalledWith('intune-tenant', 'intune-client', 'intune-secret');
        expect(identity.DefaultAzureCredential).not.toHaveBeenCalled();
    });

    it('falls back to DefaultAzureCredential when only the unprefixed AZURE_* vars are set', async () => {
        process.env.AZURE_TENANT_ID = 'tenant';
        process.env.AZURE_CLIENT_ID = 'client';
        process.env.AZURE_CLIENT_SECRET = 'secret';

        const {helpers, identity} = await loadHelpers();
        await helpers.graphRequest('beta/x', 'GET');

        expect(identity.DefaultAzureCredential).toHaveBeenCalledTimes(1);
        expect(identity.ClientSecretCredential).not.toHaveBeenCalled();
    });

    it('falls back to DefaultAzureCredential without throwing when no secret is set anywhere', async () => {
        const {helpers, identity} = await loadHelpers();

        await expect(helpers.graphRequest('beta/x', 'GET')).resolves.toBeDefined();
        expect(identity.DefaultAzureCredential).toHaveBeenCalledTimes(1);
        expect(identity.ClientSecretCredential).not.toHaveBeenCalled();
    });

    it('falls back to DefaultAzureCredential on a partial INTUNE_AZURE_* set, never mixing INTUNE_*/AZURE_* values', async () => {
        process.env.INTUNE_AZURE_TENANT_ID = 'intune-tenant';
        process.env.INTUNE_AZURE_CLIENT_ID = 'intune-client';
        process.env.INTUNE_AZURE_CLIENT_SECRET = ''; // present but empty — must not count as "set"
        process.env.AZURE_TENANT_ID = 'other-tenant';
        process.env.AZURE_CLIENT_ID = 'other-client';
        process.env.AZURE_CLIENT_SECRET = 'other-secret';

        const {helpers, identity} = await loadHelpers();
        await helpers.graphRequest('beta/x', 'GET');

        expect(identity.ClientSecretCredential).not.toHaveBeenCalled();
        expect(identity.DefaultAzureCredential).toHaveBeenCalledTimes(1);
    });

    it('constructs exactly one credential across N sequential graphRequest calls', async () => {
        process.env.INTUNE_AZURE_TENANT_ID = 'intune-tenant';
        process.env.INTUNE_AZURE_CLIENT_ID = 'intune-client';
        process.env.INTUNE_AZURE_CLIENT_SECRET = 'intune-secret';

        const {helpers, identity} = await loadHelpers();
        await helpers.graphRequest('beta/a', 'GET');
        await helpers.graphRequest('beta/b', 'GET');
        await helpers.graphRequest('beta/c', 'GET');

        expect(identity.ClientSecretCredential).toHaveBeenCalledTimes(1);
    });

    it('throws an error naming the Graph scope when getToken resolves null, without calling fetch', async () => {
        const {helpers} = await loadHelpers(null);

        await expect(helpers.graphRequest('beta/x', 'GET')).rejects.toThrow('https://graph.microsoft.com/.default');
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
