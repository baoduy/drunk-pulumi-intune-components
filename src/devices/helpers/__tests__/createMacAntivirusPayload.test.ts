import {createMacAntivirusPayload} from '../createMacAntivirusPayload';

describe('createMacAntivirusPayload', () => {
    it('builds a macOS configuration policy using the given name', () => {
        const payload = createMacAntivirusPayload({name: 'AV Policy'});

        expect(payload.name).toBe('AV Policy');
        expect(payload.platforms).toBe('macOS');
        expect(payload.roleScopeTagIds).toEqual(['0']);
    });

    it('defaults description to name when not provided', () => {
        const payload = createMacAntivirusPayload({name: 'AV Policy'});

        expect(payload.description).toBe('AV Policy');
    });

    it('uses the provided description when given', () => {
        const payload = createMacAntivirusPayload({name: 'AV Policy', description: 'custom description'});

        expect(payload.description).toBe('custom description');
    });
});
