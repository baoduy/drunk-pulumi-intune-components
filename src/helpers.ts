import {ClientSecretCredential} from '@azure/identity';
// import {AzureIdentityAuthenticationProvider} from "@microsoft/kiota-authentication-azure";
// import {FetchRequestAdapter} from "@microsoft/kiota-http-fetchlibrary";
// import {createGraphBetaServiceClient} from "@microsoft/msgraph-beta-sdk";
// import "@microsoft/msgraph-beta-sdk-devicemanagement";

const getAzToken = async () => {
    const tenantId = process.env.INTUNE_AZURE_TENANT_ID!;
    const clientId = process.env.INTUNE_AZURE_CLIENT_ID!;
    const clientSecret = process.env.INTUNE_AZURE_CLIENT_SECRET!;
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret,);
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
//
// export function createDeviceClient() {
//     const tenantId = process.env.INTUNE_AZURE_TENANT_ID!;
//     const clientId = process.env.INTUNE_AZURE_CLIENT_ID!;
//     const clientSecret = process.env.INTUNE_AZURE_CLIENT_SECRET!;
//
//     // @azure/identity
//     const credential = new ClientSecretCredential(tenantId, clientId, clientSecret,);
//
// // @microsoft/kiota-authentication-azure
//     const authProvider = new AzureIdentityAuthenticationProvider(credential, ["https://graph.microsoft.com/.default"]);
//
//     const requestAdapter = new FetchRequestAdapter(authProvider);
//     const client = createGraphBetaServiceClient(requestAdapter);
//     return client.deviceManagement;
// }
//
