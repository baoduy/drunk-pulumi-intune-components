import * as fs from 'fs';
import * as path from 'path';
import {ConfigurationArgs, CustomConfiguration} from '../types';

export type CustomConfigArgs = ConfigurationArgs & {
    payloadName: string;
    payloadFile: string,
    deploymentChannel: 'deviceChannel'
};

export const createMacCustomConfig = ({
                                          name,
                                          description,
                                          deploymentChannel,
                                          payloadName,
                                          payloadFile,
                                      }: CustomConfigArgs): CustomConfiguration => {
    // Extract filename from the path
    const payloadFileName = path.basename(payloadFile);
    // Read file content and convert to base64
    const fileContent = fs.readFileSync(payloadFile, 'utf-8');
    const payload = Buffer.from(fileContent).toString('base64');

    return {
        "@odata.type": "#microsoft.graph.macOSCustomConfiguration",
        id: "00000000-0000-0000-0000-000000000000",
        roleScopeTagIds: ['0'],
        description: description ?? name,
        displayName: name,
        deploymentChannel,
        payloadName,
        payloadFileName,
        payload,
    };
};
