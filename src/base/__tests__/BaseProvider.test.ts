import {BaseProvider} from '../BaseProvider';

class TestProvider extends BaseProvider<{value: string}, {value: string}> {
    public create = jest.fn(async (inputs: {value: string}) => ({id: 'test-id', outs: inputs}));
}

describe('BaseProvider', () => {
    it('diff reports no change for identical inputs', async () => {
        const provider = new TestProvider();

        const result = await provider.diff('id', {value: 'same'}, {value: 'same'});

        expect(result).toEqual({changes: false});
    });

    it('diff reports a change for differing inputs', async () => {
        const provider = new TestProvider();

        const result = await provider.diff('id', {value: 'old'}, {value: 'new'});

        expect(result).toEqual({changes: true});
    });

    it('default update delegates to create with the new inputs', async () => {
        const provider = new TestProvider();

        const result = await provider.update('id', {value: 'old'}, {value: 'new'});

        expect(provider.create).toHaveBeenCalledWith({value: 'new'});
        expect(result).toEqual({id: 'test-id', outs: {value: 'new'}});
    });
});
