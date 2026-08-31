import {createMacDiskEncryptionPayload} from '../createMacDiskEncryptionPayload';

describe('createMacDiskEncryptionPayload', () => {
    it('defaults description to name and uses the fallback recovery key escrow message', () => {
        const payload = createMacDiskEncryptionPayload({name: 'FileVault'});

        expect(payload.description).toBe('FileVault');
        const escrowSetting: any = payload.settings![1];
        expect(escrowSetting.settingInstance.groupSettingCollectionValue[0].children[0].simpleSettingValue.value).toBe(
            'Please contact IT-HelpDesk for help',
        );
    });

    it('uses the provided description and recovery key escrow message', () => {
        const payload = createMacDiskEncryptionPayload({
            name: 'FileVault',
            description: 'custom description',
            fileVaultRecoveryKeyEscrow: 'Contact security team',
        });

        expect(payload.description).toBe('custom description');
        const escrowSetting: any = payload.settings![1];
        expect(escrowSetting.settingInstance.groupSettingCollectionValue[0].children[0].simpleSettingValue.value).toBe(
            'Contact security team',
        );
    });
});
