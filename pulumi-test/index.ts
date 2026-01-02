import * as pulumi from '@pulumi/pulumi';
import { OriginCertResource } from '@drunk-pulumi/intune-components';

const cert = new OriginCertResource('hbdstack.dev', { domain: 'hbdstack.dev' });

cert.id.apply((r) => {
  console.log(r);
});
