import * as alt from 'alt-client';
import * as native from 'natives';

alt.onServer('fadeOut', () => {
    native.doScreenFadeOut(200);
    alt.setTimeout(() => {
        native.doScreenFadeIn(200);
    }, 350);
});

alt.onServer('setPortalPositionKeepVehicle', (x, y, z) => {
    native.setPedCoordsKeepVehicle(this, x, y, z);
});
