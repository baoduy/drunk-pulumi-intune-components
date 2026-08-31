import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {createMacConfigs, createMacCustomConfig, loadBase64FileContent} from '../createMacCustomConfig';

describe('loadBase64FileContent', () => {
    it('reads the file and returns its name, raw content and base64 payload', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mac-config-'));
        const filePath = path.join(dir, 'sample.txt');
        fs.writeFileSync(filePath, 'hello');

        const result = loadBase64FileContent(filePath);

        expect(result).toEqual({fileName: 'sample.txt', fileContent: 'hello', fileBase64: Buffer.from('hello').toString('base64')});
    });
});

describe('createMacCustomConfig', () => {
    let dir: string;

    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mac-config-'));
    });

    it('builds a DeviceConfiguration for a .json payload, dropping redundant properties', () => {
        const filePath = path.join(dir, 'policy.json');
        fs.writeFileSync(filePath, JSON.stringify({id: 'stale-id', settingA: true}));

        const result = createMacCustomConfig({
            name: 'policy',
            deploymentChannel: 'deviceChannel',
            payloadFile: filePath,
        });

        expect(result.type).toBe('DeviceConfiguration');
        expect(result.platform).toBe('macOS');
        expect(result.config).toEqual({settingA: true, description: 'policy', displayName: 'policy', name: 'policy'});
    });

    it('throws a descriptive error for a .json payload with invalid JSON', () => {
        const filePath = path.join(dir, 'broken.json');
        fs.writeFileSync(filePath, '{not json');

        expect(() =>
            createMacCustomConfig({name: 'broken', deploymentChannel: 'deviceChannel', payloadFile: filePath}),
        ).toThrow('Unable to convert content to JSON: broken.json');
    });

    it('builds a DeviceCustomConfiguration for a .crt payload', () => {
        const filePath = path.join(dir, 'root.crt');
        fs.writeFileSync(filePath, 'cert-bytes');

        const result = createMacCustomConfig({name: 'root', deploymentChannel: 'deviceChannel', payloadFile: filePath});

        expect(result.type).toBe('DeviceCustomConfiguration');
        expect(result.config).toMatchObject({
            '@odata.type': '#microsoft.graph.macOSTrustedRootCertificate',
            certFileName: 'root.crt',
            trustedRootCertificate: Buffer.from('cert-bytes').toString('base64'),
        });
    });

    it('builds a generic DeviceCustomConfiguration for any other payload extension', () => {
        const filePath = path.join(dir, 'profile.mobileconfig');
        fs.writeFileSync(filePath, 'plist-bytes');

        const result = createMacCustomConfig({name: 'profile', deploymentChannel: 'deviceChannel', payloadFile: filePath});

        expect(result.type).toBe('DeviceCustomConfiguration');
        expect(result.config).toMatchObject({
            '@odata.type': '#microsoft.graph.macOSCustomConfiguration',
            payloadFileName: 'profile.mobileconfig',
            payload: Buffer.from('plist-bytes').toString('base64'),
        });
    });
});

describe('createMacConfigs', () => {
    it('builds one config per whitelisted file in the directory and skips everything else', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mac-config-dir-'));
        fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify({}));
        fs.writeFileSync(path.join(dir, 'b.crt'), 'cert-bytes');
        fs.writeFileSync(path.join(dir, 'ignore.txt'), 'not whitelisted');

        const configs = createMacConfigs({configDir: dir, deploymentChannel: 'deviceChannel', namePrefix: 'prefix'});

        expect(configs).toHaveLength(2);
        expect(configs.map((c) => c.name).sort()).toEqual(['prefix-a', 'prefix-b']);
    });
});
