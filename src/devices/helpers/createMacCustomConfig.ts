import * as fs from 'fs';
import * as path from 'path';
import {ConfigurationArgs, CustomConfiguration, CustomTrustedCertificate} from '../types';

export const loadBase64FileContent = (filePath: string) => {
    // Extract filename from the path
    const fileName = path.basename(filePath);
    // Read file content and convert to base64
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const payload = Buffer.from(fileContent).toString('base64');

    return {fileName, fileBase64: payload};
};

export type CustomConfigArgs = ConfigurationArgs & {
    payloadFile: string;
    deploymentChannel: 'deviceChannel';
};

const whitelistedExtensions = ['.mobileconfig', '.crt', '.xml'];

export type DirectoryMacConfigsImporterArgs = {
    configDir: string;
    deploymentChannel: 'deviceChannel';
    namePrefix: string;
    description?: string;
};

export const createMacConfigs = ({
                                     configDir,
                                     deploymentChannel,
                                     namePrefix,
                                     description,
                                 }: DirectoryMacConfigsImporterArgs): (CustomConfiguration | CustomTrustedCertificate)[] => {
    const configs: (CustomConfiguration | CustomTrustedCertificate)[] = [];

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

export const createMacCustomConfig = ({
                                          name,
                                          description,
                                          deploymentChannel,
                                          payloadFile,
                                      }: CustomConfigArgs): CustomConfiguration | CustomTrustedCertificate => {
    const {fileName, fileBase64} = loadBase64FileContent(payloadFile);
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));

    if (fileName.endsWith('.crt'))
        return {
            '@odata.type': '#microsoft.graph.macOSTrustedRootCertificate',
            id: '00000000-0000-0000-0000-000000000000',
            description: description ?? name,
            displayName: name,
            deploymentChannel,
            roleScopeTagIds: ['0'],
            certFileName: fileName,
            trustedRootCertificate: fileBase64,
        };

    return {
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
};
