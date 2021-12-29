import * as alt from 'alt-client';
import * as native from 'natives';
import { PushVehicle } from '../../client/systems/push';
import { isAnyMenuOpen } from '../../client/utility/menus';
import { IWheelItem, WheelMenu } from '../../client/utility/wheelMenu';
import { InputView } from '../../client/views/input';
import { PORTAL_GATE_INTERACTIONS } from '../../shared-plugins/gpPortal/enums';
import { Portal } from '../../shared-plugins/gpPortal/interfaces';
import { LOCALE_GATE_VIEW } from '../../shared-plugins/gpPortal/locales';
import { PLAYER_SYNCED_META } from '../../shared/enums/playerSynced';
import { InputOptionType, InputResult } from '../../shared/interfaces/inputMenus';

function initialCheck(): boolean {
    if (alt.Player.local.vehicle) {
        return false;
    }

    if (isAnyMenuOpen()) {
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

    const options: IWheelItem[] = [];
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
                name: `~b~${item.name}`,
                callback: () => {
                    alt.emitServer(PORTAL_GATE_INTERACTIONS.PORT, portal.uid, gateIndex, index);
                },
            });
        }
    });

    WheelMenu.create(portal.name + ': ' + gate.name, options, true);
}

alt.onServer(PORTAL_GATE_INTERACTIONS.SHOW_MENU, showMenu);

alt.onServer('fadeOut', () => {
    native.doScreenFadeOut(200);
    alt.setTimeout(() => {
        native.doScreenFadeIn(200);
    }, 350);
});

alt.onServer('setPortalPositionKeepVehicle', (x, y, z) => {
    native.setPedCoordsKeepVehicle(this, x, y, z);
});
