import {ClientSecretCredential} from '@azure/identity';

const getAzToken = async () => {
    const tenantId = process.env.INTUNE_AZURE_TENANT_ID ?? process.env.AZURE_TENANT_ID!;
    const clientId = process.env.INTUNE_AZURE_CLIENT_ID ?? process.env.AZURE_CLIENT_ID!;
    const clientSecret = process.env.INTUNE_AZURE_CLIENT_SECRET ?? process.env.AZURE_CLIENT_SECRET!;

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const token = await credential.getToken("https://graph.microsoft.com/.default");
    return token.token;
}

export const graphRequest = async (path: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: any) => {
    const url = `https://graph.microsoft.com/${path}`;
    const token = await getAzToken();

    const response = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(
            `Graph ${method} ${path} failed: ${response.status} ${response.statusText}\n${errorText}`
        );
        // status attached so callers like deleteOrWarn can tell 404 (already gone) from a real failure
        (error as any).status = response.status;
        throw error;
    }

    const text = (await response.text()).trim();
    try {
        return text ? JSON.parse(text) : text;
    } catch {
        return text;
    }
}

/**
 * Runs a Graph delete `action` and never rejects (DRK-778).
 *
 * Deletes are intentionally non-blocking: a Graph failure here must not abort
 * `pulumi destroy` for the rest of the stack. On failure the resource is
 * already dropped from Pulumi state — the caller has no way to retry it — so
 * this logs an actionable message and the operator removes the tenant object
 * by hand. This is the requester's explicit decision on DRK-778, not an
 * oversight; `create` and `update` deliberately still rethrow on failure.
 * A 404 means the object is already gone and is treated as success, not an error.
 *
 * @param resource human-readable resource kind, used only in the log line
 * @param id the Graph/Pulumi id being deleted, used only in the log line
 * @param action performs the actual Graph DELETE/unassign call
 */
export const deleteOrWarn = async (resource: string, id: string, action: () => Promise<any>): Promise<void> => {
    try {
        await action();
    } catch (error: any) {
        if (error?.status === 404) return;
        console.error(
            `[intune] Failed to delete ${resource} '${id}'. Pulumi has removed it from state — delete it manually in the Intune portal. Cause: ${error?.message ?? error}`
        );
    }
}

