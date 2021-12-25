import * as alt from 'alt-server';
import { playerFuncs } from '../../server/extensions/Player';
import ChatController from '../../server/systems/chat';
import { INTERIOR_SYSTEM } from '../../shared-plugins/core-interiors/flags';
import { Interior } from '../../shared-plugins/core-interiors/interfaces';
import { PERMISSIONS } from '../../shared/flags/permissionFlags';
import { InputMenu, InputOptionType, InputResult } from '../../shared/interfaces/inputMenus';
import { Vector3 } from '../../shared/interfaces/vector';
import { isFlagEnabled } from '../../shared/utility/flags';
import { PortalSystem } from './system';
import { Portal, Gate } from './interfaces';

ChatController.addCommand('addportal', '/addportal [name] - Adds a portal at current position', PERMISSIONS.ADMIN, addportal);

async function addportal(player: alt.Player) {
    //TODO Select box    
    const menu: InputMenu = {
        title: 'Create Portal',
        options: [
            {
                id: 'name',
                desc: 'Name of new Portal or UID of existing Portal',
                placeholder: 'Portal Name',
                type: InputOptionType.TEXT,
                error: 'Must specify property name.',
            },
            {
                id: 'gatename',
                desc: 'Name of the gate',
                placeholder: 'Gate Name',
                type: InputOptionType.TEXT,
                error: 'Must specify property name.',
            },
            // {
            //     id: 'gateposition',
            //     desc: 'Optional position correction of Gate. As JSON String.',
            //     placeholder: `{ "x": ${player.pos.x}, "y": ${player.pos.y}, "z": ${player.pos.z} }`,
            //     type: InputOptionType.TEXT,

            //     error: 'Must specify property position.',
            // },
            // {
            //     id: 'dimension',
            //     desc: 'Optional in another dimension?',
            //     placeholder: `false`,
            //     type: InputOptionType.TEXT,
            //     error: 'Must specify property position.',
            // },
            // {
            //     id: 'ipl',
            //     desc: 'Optional IPL to load when jumping to this gate.',
            //     placeholder: 'Google it or use Interior plugin',
            //     type: InputOptionType.TEXT,
            // },
        ],
        serverEvent: 'cmd:Create:Portal',
    };

    playerFuncs.emit.inputMenu(player, menu);
}

alt.onClient('cmd:Create:Portal', async (player: alt.Player, results: InputResult[]) => {
    if (!results) {
        return;
    }

    if (!player.accountData) {
        return;
    }

    if (!isFlagEnabled(player.accountData.permissionLevel, PERMISSIONS.ADMIN)) {
        return;
    }

    const [name, gatename, gateposition, dimension, ipl] = results;

    if (!name || !gatename) {
        playerFuncs.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    if (!name.value || !gatename.value) {
        playerFuncs.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    let gatePos: Vector3;

    if (!gateposition || !gateposition.value) {
        gatePos = { "x": player.pos.x, "y": player.pos.y, "z": player.pos.z - 0.5 };
    } else {
        try {
            gatePos = JSON.parse(gateposition.value);
        } catch (err) {
            playerFuncs.emit.message(player, `Not a valid Vector3 JSON`);
            return;
        }
    }

    if (!gatePos) {
        playerFuncs.emit.message(player, `Not a valid Vector3 JSON`);
        return;
    }

    let inAnotherDim = false;
    if (!dimension || !dimension.value || dimension.value === "false") {
        inAnotherDim = false;
    } else if (dimension.value === "false") {
        inAnotherDim = true;
    }

    //New Gate Data
    const gateData: Gate = {
        name: gatename.value,
        position: gatePos,
        isUnlocked: false,
        inAnotherDimension: inAnotherDim
    }

    if (ipl && ipl.value) {
        gateData.ipl = ipl.value;
    }

    //Get Existing Portal gates
    let portal = await PortalSystem.getByName(name.value);
    let uid = null;

    if (portal) {
        uid = portal.uid;
        PortalSystem.addGate(portal, gateData);
    } else {
        let gates = new Array<Gate>();

        gates.push(gateData);

        const portalData: Portal = {
            name: name.value,
            gates: gates,
            owner: player.data._id.toString()
        };

        uid = await PortalSystem.add(portalData);
    }

    playerFuncs.emit.message(player, `Created Gate for Portal with UID: ` + uid);
});
