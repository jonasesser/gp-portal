import * as alt from 'alt-server';
import { GP_Events_Portal } from '../../shared-plugins/gpPortal/events';

declare module 'alt-server' {
    export interface Player {
        setPortalPosition(position: alt.Vector3, rotation: alt.Vector3);
        setPortalPositionKeepVehicle(position: alt.Vector3, rotation: alt.Vector3);
        setPortalPositionKeepVehicleWithVelocity(
            position: alt.Vector3,
            rotation: alt.Vector3,
            velocity: alt.Vector3,
            speed: number,
        );
    }
}

alt.Player.prototype.setPortalPosition = function (position, rotation) {
    alt.emitClient(this, GP_Events_Portal.FadeOut);
    alt.setTimeout(() => {
        //Safely set a player's position.
        if (!this.hasModel) {
            this.hasModel = true;
            this.spawn(position.x, position.y, position.z, 0);
            this.model = `mp_m_freemode_01`;
        }

        this.acPosition = position;
        this.pos = position;
        this.rot = rotation;
    }, 400);
};

alt.Player.prototype.setPortalPositionKeepVehicle = function (position, rotation) {
    alt.emitClient(this, GP_Events_Portal.FadeOut);
    alt.setTimeout(() => {
        this.vehicle.pos = position;
        this.vehicle.rot = rotation;
    }, 400);
};

alt.Player.prototype.setPortalPositionKeepVehicleWithVelocity = function (position, rotation, velocity, boost) {
    alt.emitClient(this, GP_Events_Portal.SaveCurrentVehicleSpeed);
    alt.emitClient(this, GP_Events_Portal.FadeOut);
    alt.setTimeout(() => {
        this.vehicle.pos = position;
        this.vehicle.rot = rotation;
        alt.emitClient(this, GP_Events_Portal.SetVehicleSpeed, velocity, rotation, boost);
    }, 400);
};
