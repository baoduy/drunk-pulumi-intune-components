import { createMacCompliancePayload } from './createMacCompliancePayload';
import { createMacAntivirusPayload } from './createMacAntivirusPayload';
import { createMacDiskEncryptionPayload, MacDiskEncryptionPayloadArgs } from './createMacDiskEncryptionPayload';
import { createMacFirewallPayload, MacFirewallConfigurationArgs } from './createMacFirewallPayload';
import {
  createMacCustomConfig,
  createMacConfigs,
  DirectoryMacConfigsImporterArgs,
  CustomConfigArgs,
} from './createMacCustomConfig';

export type {
  CustomConfigArgs,
  MacDiskEncryptionPayloadArgs,
  MacFirewallConfigurationArgs,
  DirectoryMacConfigsImporterArgs,
};

export default {
  createMacAntivirusPayload,
  createMacCompliancePayload,
  createMacDiskEncryptionPayload,
  createMacFirewallPayload,
  createMacCustomConfig,
  createMacConfigs,
};
