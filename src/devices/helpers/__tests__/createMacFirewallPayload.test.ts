import {createMacFirewallPayload} from '../createMacFirewallPayload';

const getFirewallChildren = (payload: ReturnType<typeof createMacFirewallPayload>): any[] =>
    (payload.settings![0] as any).settingInstance.groupSettingCollectionValue[0].children;

describe('createMacFirewallPayload', () => {
    it('reflects boolean toggles into their choice-setting values', () => {
        const payload = createMacFirewallPayload({
            name: 'Firewall',
            enableStealthMode: true,
            blockAllIncoming: true,
            allowBuiltInApps: false,
            allowSignedApps: false,
        });

        const children = getFirewallChildren(payload);
        expect(children[0].choiceSettingValue.value).toBe('com.apple.security.firewall_enablestealthmode_true');
        expect(children[2].choiceSettingValue.value).toBe('com.apple.security.firewall_blockallincoming_true');
        expect(children[3].choiceSettingValue.value).toBe('com.apple.security.firewall_allowsigned_false');
        expect(children[4].choiceSettingValue.value).toBe('com.apple.security.firewall_allowsignedapp_false');
    });

    it('reflects allowBuiltInApps and allowSignedApps when true', () => {
        const payload = createMacFirewallPayload({name: 'Firewall', allowBuiltInApps: true, allowSignedApps: true});

        const children = getFirewallChildren(payload);
        expect(children[3].choiceSettingValue.value).toBe('com.apple.security.firewall_allowsigned_true');
        expect(children[4].choiceSettingValue.value).toBe('com.apple.security.firewall_allowsignedapp_true');
    });

    it('does not add an allowed-applications setting when none are given', () => {
        const payload = createMacFirewallPayload({name: 'Firewall'});

        expect(getFirewallChildren(payload)).toHaveLength(5);
    });

    it('appends an allowed-applications setting listing each app id when given', () => {
        const payload = createMacFirewallPayload({name: 'Firewall', allowedApplications: ['com.app.one', 'com.app.two']});

        const children = getFirewallChildren(payload);
        expect(children).toHaveLength(6);
        expect(children[5].settingDefinitionId).toBe('com.apple.security.firewall_applications');
        expect(children[5].groupSettingCollectionValue).toHaveLength(2);
    });
});
