import {createMacCompliancePayload} from '../createMacCompliancePayload';

describe('createMacCompliancePayload', () => {
    it('applies documented defaults when no overrides are given', () => {
        const payload = createMacCompliancePayload({});

        expect(payload.displayName).toBe('MACOS Compliance Policy');
        expect(payload.description).toBe('Compliance policy for MacOS devices');
        expect(payload.passwordRequired).toBe(true);
        expect(payload.deviceThreatProtectionEnabled).toBe(false);
    });

    it('lets caller-supplied properties override the defaults', () => {
        const payload = createMacCompliancePayload({
            displayName: 'Custom Policy',
            passwordRequired: false,
            deviceThreatProtectionEnabled: true,
        });

        expect(payload.displayName).toBe('Custom Policy');
        expect(payload.passwordRequired).toBe(false);
        expect(payload.deviceThreatProtectionEnabled).toBe(true);
    });

    it('builds zero-grace-period schedule actions when none are requested', () => {
        const payload = createMacCompliancePayload({});

        const rule = payload.scheduledActionsForRule![0].scheduledActionConfigurations!;
        expect(rule[0].gracePeriodHours).toBe(0);
        expect(rule[1].gracePeriodHours).toBe(0);
    });

    it('converts scheduledActions days into gracePeriodHours', () => {
        const payload = createMacCompliancePayload({
            scheduledActions: {markDeviceNoncompliantDays: 2, remotelyLockNoncompliantDeviceDays: 3},
        });

        const rule = payload.scheduledActionsForRule![0].scheduledActionConfigurations!;
        expect(rule[0].gracePeriodHours).toBe(48);
        expect(rule[1].gracePeriodHours).toBe(72);
    });
});
