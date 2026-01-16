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
        throw new Error(
            `Error reading wrap app: ${response.status} ${response.statusText}\nError: ${errorText}`
        );
    }

    const text = (await response.text()).trim();
    try {
        return text ? JSON.parse(text) : text;
    } catch {
        return text;
    }
}

