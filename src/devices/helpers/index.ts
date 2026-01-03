import {createMacCompliancePayload} from './createMacCompliancePayload';
import {createMacAntivirusPayload} from './createMacAntivirusPayload';
import {createMacDiskEncryptionPayload, MacDiskEncryptionPayloadArgs} from './createMacDiskEncryptionPayload';
import {createMacFirewallPayload, MacFirewallConfigurationArgs} from './createMacFirewallPayload';

export type {MacDiskEncryptionPayloadArgs, MacFirewallConfigurationArgs};

export default {
    createMacAntivirusPayload,
    createMacCompliancePayload,
    createMacDiskEncryptionPayload,
    createMacFirewallPayload,
};