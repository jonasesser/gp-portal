import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { PortalSystem } from './system';
import { MARKER_TYPE } from '../../../shared/enums/markerTypes';
import { Gate, Portal } from '../shared/interfaces';
import { GP_Portal_Enitities } from '../shared/enums';
import { Vector3 } from 'alt-server';
import {
    InputMenu,
    InputOptionType,
    InputResult,
    SelectOption,
} from '@AthenaPlugins/gp-athena-utils/shared/interfaces/inputMenus';
import { GP_Events_Portal } from '../shared/events';

//TODO: Replace Menu!

Athena.systems.messenger.commands.register(
    'addportal',
    '/addportal - Adds a portal at current position',
    ['admin'],
    addportal,
);

async function addportal(player: alt.Player, arg1: string) {
    let markerOptions = new Array<SelectOption>();
    markerOptions.push({ text: 'none', value: 'none' });
    for (var key in MARKER_TYPE) {
        var isValueProperty = parseInt(key) >= 0;
        if (!isValueProperty) {
            markerOptions.push({ text: key, value: MARKER_TYPE[key] });
        }
    }
    //TODO Select box
    const menu: InputMenu = {
        title: 'Create Portal',
        options: [
            {
                id: 'name',
                desc: 'Name of new or existing Portal',
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
            {
                id: 'gatemarker',
                desc: 'Select a marker or none for hidden gate',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: markerOptions,
            },
            {
                id: 'gatemarkersize',
                desc: 'Select a marker size',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'small', value: '0.25' },
                    { text: 'medium', value: '0.75' },
                    { text: 'big', value: '1' },
                ],
            },
            {
                id: 'gateentity',
                desc: 'Select the entity that can use the gate. Default: Person',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'Person', value: GP_Portal_Enitities.Person },
                    { text: 'Vehicle', value: GP_Portal_Enitities.Vehicle },
                    { text: 'All', value: GP_Portal_Enitities.All },
                ],
            },
            {
                id: 'dimension',
                desc: 'Create gate in another dimension',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'Yes', value: 'true' },
                    { text: 'No', value: 'false' },
                ],
            },
            {
                id: 'setgaterotation',
                desc: 'User current persons rotation for gate exit',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'Yes', value: 'true' },
                    { text: 'No', value: 'false' },
                ],
            },
            {
                id: 'autotrigger',
                desc: 'Should this gate automatacally trigger, no E key needed!',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'Yes', value: 'true' },
                    { text: 'No', value: 'false' },
                ],
            },
            {
                id: 'effect',
                desc: 'Gate effect',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'None', value: 'none' },
                    { text: 'Fade', value: 'fade' },
                    { text: 'Space (Experimental)', value: 'space' },
                ],
            },
            {
                id: 'experimentalgate',
                desc: 'Experimental Gate',
                placeholder: '',
                type: InputOptionType.CHOICE,
                error: 'Must specify property name.',
                choices: [
                    { text: 'None', value: 'none' },
                    { text: 'Speed', value: 'speed' },
                    { text: 'SpeedBoost', value: 'boost' },
                ],
            },
            // {
            //     id: 'gateposition',
            //     desc: 'Optional position correction of Gate. As JSON String.',
            //     placeholder: `{ "x": ${player.pos.x}, "y": ${player.pos.y}, "z": ${player.pos.z} }`,
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
        serverEvent: GP_Events_Portal.CreatePortal,
    };

    const gpUtils = await Athena.systems.plugins.useAPI('gputils');
    gpUtils.inputMenu(player, menu);
}

alt.onClient(GP_Events_Portal.CreatePortal, async (player: alt.Player, results: InputResult[]) => {
    if (!results) {
        return;
    }

    if (!Athena.player.permission.hasAccountPermission(player, 'admin')) {
        return;
    }
    //Do not change order, must same like in addPortal method.
    const [
        name,
        gatename,
        gatemarker,
        gatemarkersize,
        gateentity,
        dimension,
        setgaterotation,
        autotrigger,
        effect,
        experimentalgate,
        gateposition,
        ipl,
    ] = results;
    if (!name || !gatename) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }
    if (!name.value || !gatename.value) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }
    let gatePos: Vector3;
    if (!gateposition || !gateposition.value) {
        gatePos = new Vector3({ x: player.pos.x, y: player.pos.y, z: player.pos.z - 1 });
    } else {
        try {
            gatePos = JSON.parse(gateposition.value);
        } catch (err) {
            Athena.player.emit.message(player, `Not a valid Vector3 JSON`);
            return;
        }
    }
    if (!gatePos) {
        Athena.player.emit.message(player, `Not a valid Vector3 JSON`);
        return;
    }
    let inAnotherDim = false;
    if (!dimension || !dimension.value || dimension.value === 'false') {
        inAnotherDim = false;
    } else if (dimension.value === 'true') {
        inAnotherDim = true;
    }
    //New Gate Data
    const gateData: Gate = {
        name: gatename.value,
        position: gatePos,
        isUnlocked: false,
        inAnotherDimension: inAnotherDim,
        experimentalgate: experimentalgate.value,
    };
    if (setgaterotation.value === 'true') {
        gateData.rotation = player.rot;
    }
    if (autotrigger.value === 'true') {
        gateData.triggerOnEnter = true;
    } else {
        gateData.triggerOnEnter = false;
    }
    if (effect.value) {
        gateData.effect = effect.value;
    }
    if (gatemarker.value === 'none') {
        gateData.hidden = true;
    } else {
        gateData.markertype = parseInt(gatemarker.value);
    }
    if (gatemarkersize && gatemarkersize.value) {
        gateData.markersize = parseFloat(gatemarkersize.value);
    }
    if (gateentity && gateentity.value) {
        gateData.entity = gateentity.value;
    }
    if (ipl && ipl.value) {
        gateData.ipl = ipl.value;
    }
    //Get Existing Portal gates
    let portal = await PortalSystem.getByName(name.value);
    alt.logWarning('Existing Portalgate: ' + JSON.stringify(portal));
    let uid = null;
    if (portal) {
        uid = portal.uid;
        alt.logWarning('Add Gate: ' + JSON.stringify(gateData));
        PortalSystem.addGate(portal, gateData);
    } else {
        let gates = new Array<Gate>();
        gates.push(gateData);
        const portalData: Portal = {
            name: name.value,
            uid: 'portal-' + name.value,
            gates: gates,
            owner: player.data._id.toString(),
        };
        uid = await PortalSystem.add(portalData);
    }
    Athena.player.emit.message(player, `Created Gate for Portal with UID: ` + uid);
});
