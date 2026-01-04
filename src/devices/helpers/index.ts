import {createMacCompliancePayload} from './createMacCompliancePayload';
import {createMacAntivirusPayload} from './createMacAntivirusPayload';
import {createMacDiskEncryptionPayload, MacDiskEncryptionPayloadArgs} from './createMacDiskEncryptionPayload';
import {createMacFirewallPayload, MacFirewallConfigurationArgs} from './createMacFirewallPayload';
import {createMacCustomConfig, CustomConfigArgs} from './createMacCustomConfig';

export type {CustomConfigArgs, MacDiskEncryptionPayloadArgs, MacFirewallConfigurationArgs};

export default {
    createMacAntivirusPayload,
    createMacCompliancePayload,
    createMacDiskEncryptionPayload,
    createMacFirewallPayload,
    createMacCustomConfig
};