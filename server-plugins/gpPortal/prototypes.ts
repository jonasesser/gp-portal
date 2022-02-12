import * as alt from 'alt-server';
import { playerFuncs } from '../../server/extensions/extPlayer';
import { GP_Events_Portal } from '../../shared-plugins/gpPortal/events';

declare module 'alt-server' {
    export interface Player {
        setPortalPosition(position: alt.Vector3, rotation: alt.Vector3, dimension: number, effect: string);
        setPortalPositionKeepVehicle(position: alt.Vector3, rotation: alt.Vector3, dimension: number, effect: string);
        setPortalPositionKeepVehicleWithVelocity(
            position: alt.Vector3,
            rotation: alt.Vector3,
            velocity: alt.Vector3,
            speed: number,
            dimension: number,
            effect: string,
        );
    }
}

alt.Player.prototype.setPortalPosition = function (position, rotation, dimension, effect) {
    let portAfter = 0;
    if (!effect || effect === 'fade') {
        alt.emitClient(this, GP_Events_Portal.FadeEffect);
        portAfter = 400;
    } else if (effect === 'space') {
        alt.emitClient(this, GP_Events_Portal.SpaceEffect);
        portAfter = 2000;
    }

    alt.setTimeout(() => {
        alt.logWarning('[GPPORTAL] Port Player, Gate Dimension: ' + dimension);
        //Safely set a player's position.
        if (!this.hasModel) {
            this.hasModel = true;
            this.spawn(position.x, position.y, position.z, 0);
            this.model = `mp_m_freemode_01`;
        }

        this.acPosition = position;
        this.pos = position;
        this.rot = rotation;
        this.dimension = dimension;
        playerFuncs.safe.setDimension(this, dimension);
    }, portAfter);
};

alt.Player.prototype.setPortalPositionKeepVehicle = function (position, rotation, dimension, effect) {
    alt.logWarning('[GPPORTAL] Port Player, Gate Dimension: ' + dimension);
    let portAfter = 0;
    if (!effect || effect === 'fade') {
        alt.emitClient(this, GP_Events_Portal.FadeEffect);
        portAfter = 400;
    } else if (effect === 'space') {
        alt.emitClient(this, GP_Events_Portal.SpaceEffect);
        portAfter = 2000;
    }
    alt.setTimeout(() => {
        this.vehicle.pos = position;
        this.vehicle.rot = rotation;
        this.vehicle.dimension = dimension;
        playerFuncs.safe.setDimension(this, dimension);
    }, portAfter);
};

alt.Player.prototype.setPortalPositionKeepVehicleWithVelocity = function (
    position,
    rotation,
    velocity,
    boost,
    dimension,
    effect,
) {
    alt.logWarning('[GPPORTAL] Port Player, Gate Dimension: ' + dimension);
    alt.emitClient(this, GP_Events_Portal.SaveCurrentVehicleSpeed);

    let portAfter = 0;
    if (!effect || effect === 'fade') {
        alt.emitClient(this, GP_Events_Portal.FadeEffect);
        portAfter = 400;
    } else if (effect === 'space') {
        alt.emitClient(this, GP_Events_Portal.SpaceEffect);
        portAfter = 2000;
    }

    alt.setTimeout(() => {
        this.vehicle.pos = position;
        this.vehicle.rot = rotation;
        this.vehicle.dimension = dimension;
        playerFuncs.safe.setDimension(this, dimension);
        alt.emitClient(this, GP_Events_Portal.SetVehicleSpeed, velocity, rotation, boost);
    }, portAfter);
};
