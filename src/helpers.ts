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

