import * as pulumi from '@pulumi/pulumi';
import {BaseOptions, BaseProvider, BaseResource} from '../base';
import {graphRequest} from '../helpers';

export type RestrictionArgs = {
    platformBlocked: boolean;
    personalDeviceEnrollmentBlocked: boolean;
    osMinimumVersion?: string;
    osMaximumVersion?: string;
    blockedManufacturers?: [];
};

export interface DefaultPlatformRestrictionsInputs {
    intuneId: string;
    /**The limited of the device for each user from 1 to 10*/
    defaultDeviceLimit?: number;
    androidRestriction?: RestrictionArgs;
    iosRestriction?: RestrictionArgs;
    macosRestriction?: RestrictionArgs;
    windowsRestriction?: RestrictionArgs;
}

export interface DefaultPlatformRestrictionsOutputs extends DefaultPlatformRestrictionsInputs {
}

class DefaultPlatformRestrictionsProvider extends BaseProvider<
    DefaultPlatformRestrictionsInputs,
    DefaultPlatformRestrictionsOutputs
> {
    constructor(private name: string) {
        super();
    }

    public async create(inputs: DefaultPlatformRestrictionsInputs): Promise<pulumi.dynamic.CreateResult> {
        //Update platform restrictions
        await graphRequest(
            `beta/deviceManagement/deviceEnrollmentConfigurations/${inputs.intuneId}_DefaultPlatformRestrictions`,
            'PATCH',
            {
                '@odata.type': '#microsoft.graph.deviceEnrollmentPlatformRestrictionsConfiguration',
                androidRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: false,
                    osMinimumVersion: '',
                    osMaximumVersion: '',
                    blockedManufacturers: [],
                    ...inputs.androidRestriction,
                },
                androidForWorkRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: false,
                    osMinimumVersion: '',
                    osMaximumVersion: '',
                    blockedManufacturers: [],
                    ...inputs.androidRestriction,
                },
                iosRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: false,
                    osMinimumVersion: '',
                    osMaximumVersion: '',
                    blockedManufacturers: [],
                    ...inputs.iosRestriction,
                },
                macOSRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: true,
                    osMinimumVersion: null,
                    osMaximumVersion: null,
                    blockedManufacturers: [],
                    ...inputs.macosRestriction,
                },
                windowsRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: true,
                    osMinimumVersion: '10.0',
                    osMaximumVersion: '12.0',
                    blockedManufacturers: [],
                    ...inputs.windowsRestriction,
                },
                windowsHomeSkuRestriction: {
                    platformBlocked: true,
                    personalDeviceEnrollmentBlocked: true,
                    osMinimumVersion: '10.0',
                    osMaximumVersion: '12.0',
                    blockedManufacturers: [],
                    ...inputs.windowsRestriction,
                },
            },
        ).catch((error) => {
            console.error('configurationPolicies', error);
            throw error;
        });

        //Update Device Limit
        await graphRequest(
            `beta/deviceManagement/deviceEnrollmentConfigurations/${inputs.intuneId}_DefaultLimit`,
            'PATCH',
            {
                "@odata.type": "#microsoft.graph.deviceEnrollmentLimitConfiguration",
                "limit": inputs.defaultDeviceLimit ?? 5
            },
        ).catch((error) => {
            console.error('configurationPolicies', error);
            throw error;
        });

        return {id: this.name, outs: inputs};
    }

    public async update(
        id: string,
        olds: DefaultPlatformRestrictionsInputs,
        news: DefaultPlatformRestrictionsInputs,
    ): Promise<pulumi.dynamic.UpdateResult> {
        return this.create(news);
    }
}

export class DefaultPlatformRestrictionsResource extends BaseResource<
    DefaultPlatformRestrictionsInputs,
    DefaultPlatformRestrictionsOutputs
> {
    declare readonly name: string;

    constructor(
        name: string,
        props: BaseOptions<DefaultPlatformRestrictionsInputs>,
        opts?: pulumi.CustomResourceOptions,
    ) {
        super(
            new DefaultPlatformRestrictionsProvider(name),
            `drunk:intune:DefaultPlatformRestrictions:${name}`,
            props,
            opts,
        );
        this.name = name;
    }
}
