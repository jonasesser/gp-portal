import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import * as native from 'natives';
import { PLAYER_SYNCED_META } from '../../../shared/enums/playerSynced';
import { IWheelOptionExt } from '../../../shared/interfaces/wheelMenu';
import { PORTAL_GATE_INTERACTIONS } from '../shared/enums';
import { GP_Events_Portal } from '../shared/events';
import { Portal } from '../shared/interfaces';
import { LOCALE_GATE_VIEW } from '../shared/locales';
import { PortalSpaceView } from './portalSpaceView';
import { PushVehicle } from '@AthenaPlugins/gp-athena-utils/client/src/systems/push';
import { InputView } from '@AthenaPlugins/gp-athena-utils/client/src/views/input';
import { InputOptionType, InputResult } from '@AthenaPlugins/gp-athena-utils/shared/interfaces/inputMenus';

let currentVehicleSpeed = null;

PortalSpaceView.init();

function initialCheck(): boolean {
    if (alt.Player.local.vehicle) {
        return false;
    }

    if (AthenaClient.webview.isAnyMenuOpen()) {
        return false;
    }

    if (PushVehicle.isPushing()) {
        return false;
    }

    return true;
}

function showMenu(portal: Portal, gateIndex: number) {
    if (!initialCheck) {
        return;
    }

    const gate = portal.gates[gateIndex];

    const options: IWheelOptionExt[] = [];
    const playerIdentifier = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.DATABASE_ID);
    const isOwner = portal.owner === playerIdentifier;

    // Ownership Related Menu Functions
    //TODO Admin menu
    if (isOwner && false) {
        const toggleLockFunc = () => {
            alt.emitServer(PORTAL_GATE_INTERACTIONS.TOGGLE_LOCK, portal.uid, gateIndex);
        };

        options.push({
            name: gate.isUnlocked ? `~r~${LOCALE_GATE_VIEW.LABEL_TRY_LOCK}` : `~g~${LOCALE_GATE_VIEW.LABEL_TRY_UNLOCK}`,
            callback: toggleLockFunc,
        });

        options.push({
            name: `~r~${LOCALE_GATE_VIEW.LABEL_GATE_REMOVE}`,
            callback: () => {
                alt.emitServer(PORTAL_GATE_INTERACTIONS.REMOVE, portal.uid, gateIndex);
            },
        });

        options.push({
            name: `~r~${LOCALE_GATE_VIEW.LABEL_SET_GATE_NAME}`,
            callback: () => {
                const InputMenu = {
                    title: LOCALE_GATE_VIEW.LABEL_SET_GATE_NAME,
                    options: [
                        {
                            id: 'name',
                            desc: LOCALE_GATE_VIEW.LABEL_SET_GATE_NAME_PLACEHOLDER,
                            type: InputOptionType.TEXT,
                            placeholder: `floor one`,
                            regex: '^[a-zA-Z0-9 ]{1,24}$', // Matches 3 to 24 Characters
                            error: '3-24 Characters. No Special Characters.',
                        },
                    ],
                    callback: (results: InputResult[]) => {
                        // Re-show this menu if it fails to find the value.
                        if (results.length <= 0) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        // Check that there is a result.
                        const data = results.find((x) => x && x.id === 'name');
                        if (!data) {
                            InputView.setMenu(InputMenu);
                            return;
                        }

                        alt.emitServer(PORTAL_GATE_INTERACTIONS.SET_NAME, portal.uid, gateIndex, data.value);
                    },
                };

                InputView.setMenu(InputMenu);
            },
        });
    }

    //Multiple Gates
    portal.gates.forEach(function (item, index) {
        if (item.name != gate.name) {
            options.push({
                name: item.name,
                icon: item.icon ? item.icon : 'icon-engine-fill',
                color: item.color ? item.color : 'green',
                callback: () => {
                    alt.emitServer(PORTAL_GATE_INTERACTIONS.PORT, portal.uid, gateIndex, index);
                },
            });
        }
    });

    AthenaClient.systems.wheelMenu.open(portal.name + ' - ' + gate.name, options);
}

alt.onServer(PORTAL_GATE_INTERACTIONS.SHOW_MENU, showMenu);

alt.onServer(GP_Events_Portal.SpaceEffect, () => {
    PortalSpaceView.createView();
    alt.setTimeout(() => {
        native.setGameplayCamRelativeHeading(0.0);
        alt.setTimeout(() => {
            PortalSpaceView.closeView();
        }, 2000);
    }, 2000);
});

alt.onServer(GP_Events_Portal.FadeEffect, () => {
    native.doScreenFadeOut(200);

    alt.setTimeout(() => {
        native.setGameplayCamRelativeHeading(0.0);
        native.doScreenFadeIn(300);
    }, 600);
});

alt.onServer(GP_Events_Portal.SaveCurrentVehicleSpeed, () => {
    let vehicle = alt.Player.local.vehicle;
    currentVehicleSpeed = vehicle.speed;
});

alt.onServer(GP_Events_Portal.SetVehicleSpeed, (velocity: alt.Vector3, rotation: alt.Vector3, boost: number) => {
    alt.setTimeout(() => {
        let vehicle = alt.Player.local.vehicle;
        // alt.setRotationVelocity(vehicle.scriptID, rotation.x, rotation.y, rotation.z);
        alt.log('Speed: ' + currentVehicleSpeed);
        native.setVehicleForwardSpeed(vehicle.scriptID, currentVehicleSpeed * boost);
        // native.applyForceToEntityCenterOfMass
        // native.applyForceToEntity
    }, 350);
});

alt.onServer(GP_Events_Portal.LeaveVehicle, () => {
    let vehicle = alt.Player.local.vehicle;
    if (vehicle) {
        // native.taskEveryoneLeaveVehicle(alt.Player.local.vehicle);
        native.taskLeaveVehicle(alt.Player.local.scriptID, vehicle, 0);
        for (let index = 0; index < 10; index++) {
            let ped = native.getPedInVehicleSeat(vehicle, index, false);
            if (ped) {
                native.taskLeaveVehicle(ped, vehicle, 0);
            }
        }
    }
});

alt.log(`~ly~Plugin Loaded -- gpPortal`);
