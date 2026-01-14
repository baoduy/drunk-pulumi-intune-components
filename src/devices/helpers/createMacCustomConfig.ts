import * as fs from 'fs';
import * as path from 'path';
import {ConfigurationArgs, Platforms} from '../types';

export const loadBase64FileContent = (filePath: string) => {
    // Extract filename from the path
    const fileName = path.basename(filePath);
    // Read file content and convert to base64
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const payload = Buffer.from(fileContent).toString('base64');

    return {fileName, fileBase64: payload, fileContent};
};

export type CustomConfigArgs = ConfigurationArgs & {
    payloadFile: string;
    deploymentChannel: 'deviceChannel';
};

const whitelistedExtensions = ['.mobileconfig', '.crt', '.xml', '.json'];

export type DirectoryMacConfigsImporterArgs = {
    configDir: string;
    deploymentChannel: 'deviceChannel';
    namePrefix: string;
    description?: string;
};

export type DirectoryMacConfigsImporterOutputs = {
    type: "DeviceConfiguration" | "DeviceCustomConfiguration",
    platform: Platforms,
    name: string,
    config: any
};

export const createMacConfigs = ({
                                     configDir,
                                     deploymentChannel,
                                     namePrefix,
                                     description,
                                 }: DirectoryMacConfigsImporterArgs): Array<DirectoryMacConfigsImporterOutputs> => {
    const configs = new Array<DirectoryMacConfigsImporterOutputs>();

    // Read all files from the config directory
    const files = fs.readdirSync(configDir);

    // Filter files by whitelisted extensions
    const validFiles = files.filter((file) => whitelistedExtensions.some((ext) => file.endsWith(ext)));

    // Create configuration for each valid file
    validFiles.forEach((file) => {
        const filePath = path.join(configDir, file);
        const fileNameWithoutExt = path.basename(file, path.extname(file));
        // Use mapper functions if provided, otherwise use filename-based defaults
        const name = `${namePrefix}-${fileNameWithoutExt}`;

        const config = createMacCustomConfig({
            name,
            description: description ?? `Configuration for ${fileNameWithoutExt}`,
            deploymentChannel,
            payloadFile: filePath,
        });

        configs.push(config);
    });

    return configs;
};

const redundantProperties = ['id', '"@odata.context', 'lastModifiedDateTime', 'creationSource', 'createdDateTime', 'priorityMetaData'];

export const createMacCustomConfig = ({
                                          name,
                                          description,
                                          deploymentChannel,
                                          payloadFile,
                                      }: CustomConfigArgs): DirectoryMacConfigsImporterOutputs => {
    const {fileName, fileBase64, fileContent} = loadBase64FileContent(payloadFile);
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

    try {
        if (fileName.endsWith('.json')) {
            const config = {
                ...JSON.parse(fileContent), description: description ?? name,
                displayName: name,
                name,
            };
            //Delete redundant properties
            redundantProperties.forEach((prop) => delete config[prop]);
            return {name, platform: 'macOS', type: 'DeviceConfiguration', config};
        }
    } catch (error) {
        throw new Error(`Unable to convert content to JSON: ${fileName} with error: ${error}`, {cause: fileContent});
    }

    if (fileName.endsWith('.crt')) {
        const config = {
            '@odata.type': '#microsoft.graph.macOSTrustedRootCertificate',
            id: '00000000-0000-0000-0000-000000000000',
            description: description ?? name,
            displayName: name,
            deploymentChannel,
            roleScopeTagIds: ['0'],
            certFileName: fileName,
            trustedRootCertificate: fileBase64,
        };
        return {name, platform: 'macOS', type: 'DeviceCustomConfiguration', config};
    }

    const config = {
        '@odata.type': '#microsoft.graph.macOSCustomConfiguration',
        id: '00000000-0000-0000-0000-000000000000',
        roleScopeTagIds: ['0'],
        description: description ?? name,
        displayName: name,
        deploymentChannel,
        payloadName: fileNameWithoutExt,
        payloadFileName: fileName,
        payload: fileBase64,
    };
    return {name, platform: 'macOS', type: 'DeviceCustomConfiguration', config};
};
