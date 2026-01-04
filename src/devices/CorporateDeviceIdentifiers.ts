import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import * as types from '../types';

export type CorporateDeviceIdentifierArgs = {
    importedDeviceIdentityType: "serialNumber" | 'imei',
    importedDeviceIdentifier: string,
    platform: 'unknown' | 'ios' | 'android' | 'windows' | 'windowsMobile' | 'macOS',
    description?: string;
};

export interface CorporateDeviceIdentifiersInputs {
    identifiers: Array<CorporateDeviceIdentifierArgs>;
}

export interface CorporateDeviceIdentifiersOutputs extends CorporateDeviceIdentifiersInputs {
}

class CorporateDeviceIdentifiersProvider extends BaseProvider<CorporateDeviceIdentifiersInputs, CorporateDeviceIdentifiersOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: CorporateDeviceIdentifiersInputs): Promise<pulumi.dynamic.CreateResult> {
        const payload = {
            overwriteImportedDeviceIdentities: true,
            importedDeviceIdentities: inputs.identifiers
        };

        await graphRequest(
            `beta/deviceManagement/importedDeviceIdentities/importDeviceIdentityList`,
            'POST',
            payload
        ).catch((error) => {
            console.error('importDeviceIdentityList', error);
            throw error;
        });
        return {id: this.name, outs: inputs};
    }

    public async update(
        id: string,
        olds: CorporateDeviceIdentifiersInputs,
        news: CorporateDeviceIdentifiersInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        return this.create(news);
    }

    public async delete(id: string, props: CorporateDeviceIdentifiersInputs): Promise<void> {
        // const currentList = await graphRequest(`beta/deviceManagement/importedDeviceIdentities`, 'GET');
        // await graphRequest(
        //     `beta/$batch`,
        //     'POST',
        //     {
        //         "requests": [{
        //             "headers": {"x-ms-command-name": "CorpDev_deleteImportedDeviceIdentities_BatchItem"},
        //             "id": "ZFLD72GKPQ",
        //             "method": "DELETE",
        //             "url": "/deviceManagement/importedDeviceIdentities/AlpGTEQ3MkdLUFE%3d"
        //         }]
        //     }
        // ).catch((error) => {
        //     console.error('importDeviceIdentityList', error);
        //     throw error;
        // });
    }
}

export class CorporateDeviceIdentifiersResource extends BaseResource<CorporateDeviceIdentifiersInputs, CorporateDeviceIdentifiersOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<CorporateDeviceIdentifiersInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new CorporateDeviceIdentifiersProvider(name), `drunk:intune:CorporateDeviceIdentifiers:${name}`, props, opts);
        this.name = name;
    }
}
