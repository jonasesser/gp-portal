import * as alt from 'alt-server';

declare module 'alt-server' {
    export interface Player {
        setPortalPosition(x: number, y: number, z: number);
        setPortalPositionKeepVehicle(x: number, y: number, z: number);
    }
}

alt.Player.prototype.setPortalPosition = function (x, y, z) {
    alt.emitClient(this, 'fadeOut');
    alt.setTimeout(() => {
        //Safely set a player's position.
        if (!this.hasModel) {
            this.hasModel = true;
            this.spawn(x, y, z, 0);
            this.model = `mp_m_freemode_01`;
        }

        this.acPosition = new alt.Vector3(x, y, z);
        this.pos = new alt.Vector3(x, y, z);
    }, 400);
};

alt.Player.prototype.setPortalPositionKeepVehicle = function (x, y, z) {
    alt.emitClient(this, 'fadeOut');
    alt.setTimeout(() => {
        alt.emitClient(this, 'setPortalPositionKeepVehicle', x, y, z);
    }, 400);
};
