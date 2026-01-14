import * as pulumi from '@pulumi/pulumi';
import {BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';
import * as types from '../types';

export interface DeviceCatalogInputs {
    catalogName: string
}

export interface DeviceCatalogOutputs extends DeviceCatalogInputs {
}

class DeviceCatalogProvider extends BaseProvider<DeviceCatalogInputs, DeviceCatalogOutputs> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: DeviceCatalogInputs): Promise<pulumi.dynamic.CreateResult> {
        const rs = await graphRequest(
            `beta/deviceManagement/deviceCategories`,
            'POST',
            {"displayName": inputs.catalogName, "roleScopeTagIds": ["0"]},
        ).catch((error) => {
            //ignore if deleted
            console.error('deviceCategories', error);
        });

        return {id: rs.id, outs: inputs};
    }

    public async update(id: string, olds: DeviceCatalogOutputs, news: DeviceCatalogInputs): Promise<pulumi.dynamic.UpdateResult> {
        //ignore when update
        return {outs: news};
    }

    public async delete(id: pulumi.ID, props: DeviceCatalogOutputs): Promise<void> {
        await graphRequest(
            `beta/deviceManagement/deviceCategories/${id}`,
            'DELETE',
        ).catch(error => console.error('deviceCategories', error));
    }
}

export class DeviceCatalogResource extends BaseResource<DeviceCatalogInputs, DeviceCatalogOutputs> {
    declare readonly name: string;

    constructor(name: string, props: types.AsInput<DeviceCatalogInputs>, opts?: pulumi.CustomResourceOptions) {
        super(new DeviceCatalogProvider(name), `drunk:intune:DeviceCatalog:${name}`, props, opts);
        this.name = name;
    }
}
