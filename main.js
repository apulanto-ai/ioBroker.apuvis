'use strict';

// apuVIS Adapter — minimal daemon that hosts the React SPA via iobroker.web
// The actual dashboard is in www/ and served by the web adapter at /apuvis/

const utils = require('@iobroker/adapter-core');

class ApuvisAdapter extends utils.Adapter {
    constructor(options) {
        super({
            ...options,
            name: 'apuvis',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        this.log.info('apuVIS started. Dashboard available via iobroker.web at /apuvis/');
        this.setState('info.connection', { val: true, ack: true });
    }

    onStateChange(id, state) {
        if (state) {
            this.log.debug(`State ${id} changed: ${state.val} (ack=${state.ack})`);
        }
    }

    onUnload(callback) {
        try {
            callback();
        } catch {
            callback();
        }
    }
}

if (require.main !== module) {
    module.exports = (options) => new ApuvisAdapter(options);
} else {
    new ApuvisAdapter();
}
