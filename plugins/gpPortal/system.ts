import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PORTAL_COLLECTIONS, PORTAL_GATE_INTERACTIONS } from '../../shared-plugins/gpPortal/enums';
import { ServerMarkerController } from '../../server/streamers/marker';
import { InteractionController } from '../../server/systems/interaction';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { deepCloneObject } from '../../shared/utility/deepCopy';
import { sha256Random } from '../../server/utility/encryption';
import './cmds';
import './prototypes';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { playerFuncs } from '../../server/extensions/Player';
import { Gate, GateInternal, Portal, PortalInternal } from '../../shared-plugins/gpPortal/interfaces';
import { LOCALE_GATE_VIEW } from '../../shared-plugins/gpPortal/locales';

let nextDimension = 1000000;
let isInitializing = true;
const NEW_LINE = `~n~`;

const portals: Map<string, PortalInternal> = new Map();

export class PortalSystem {
    static async init(): Promise<void> {
        await Database.createCollection(PORTAL_COLLECTIONS.Portals);
        const portals = await Database.fetchAllData<Portal>(PORTAL_COLLECTIONS.Portals);

        if (portals.length <= 0) {
            isInitializing = false;
            return;
        }

        for (let i = 0; i < portals.length; i++) {
            await PortalSystem.create(portals[i]);
        }

        isInitializing = false;

        alt.onClient(PORTAL_GATE_INTERACTIONS.PORT, PortalSystem.portToGate);
    }

    /**
     * Creates an Portal in-game that can be interacted with;
     * this does not insert it into the database and should only be called via InteriorSystem.
     *
     * @static
     * @param {Interior} interior
     * @memberof InternalSystem
     */
    static create(portal: Portal) {
        const portalInfo: PortalInternal = {
            ...portal,
            gatesInternal: new Array<GateInternal>(),
        };

        for (let index = 0; index < portal.gates.length; index++) {
            let gateInfo = PortalSystem.createGate(portalInfo, portal.gates[index], index);
            portalInfo.gatesInternal.push(gateInfo);
        }

        portals.set(portalInfo.uid, portalInfo);
    }

    /**
     * Creates an Gate for an portal in-game that can be interacted with;
     * this does not insert it into the database and should only be called via InteriorSystem.
     *
     * @static
     * @param {Interior} interior
     * @memberof InternalSystem
     */
    static createGate(portal: PortalInternal, gate: Gate, indexTmp?: number): GateInternal {
        const gateInfo: GateInternal = {
            ...gate,
        };

        let index = portal.gatesInternal.length;
        if (indexTmp) {
            index = indexTmp;
        }

        if (gate.inAnotherDimension) {
            gateInfo.dimension = nextDimension;
            // Increment dimension for next gate added.
            nextDimension += 1;
        }

        portal._id = portal._id.toString();

        //defaults
        let markertype = 0;
        let markersize = 0.25;
        let markercolor = new alt.RGBA(255, 255, 0, 75);
        let dimension = 0;
        let markerbobUpAndDown = false;
        let markerfaceCamera = false;
        let markerrotate = false;

        if (gate.markertype) markertype = gate.markertype;
        if (gate.markersize) markersize = gate.markersize;
        if (gate.markercolor)
            markercolor = new alt.RGBA(
                gate.markercolor[0],
                gate.markercolor[1],
                gate.markercolor[2],
                gate.markercolor[3],
            );
        if (gate.markerbobUpAndDown) markerbobUpAndDown = gate.markerbobUpAndDown;
        if (gate.markerfaceCamera) markerfaceCamera = gate.markerfaceCamera;
        if (gate.markerrotate) markerrotate = gate.markerrotate;
        if (gate.dimension) dimension = gate.dimension;

        alt.logWarning('markertype: ' + markertype);
        alt.logWarning('markersize: ' + markersize);
        alt.logWarning('markercolor: ' + markercolor);
        alt.logWarning('markerbobUpAndDown: ' + markerbobUpAndDown);
        alt.logWarning('markerfaceCamera: ' + markerfaceCamera);
        alt.logWarning('markerrotate: ' + markerrotate);
        alt.logWarning('dimension: ' + dimension);

        if (!gate.hidden) {
            //Z correction for some markers
            if ([1, 8, 9, 23, 25, 26, 27, 28, 43].includes(gate.markertype)) {
                gate.position.z = gate.position.z - 0.99;
            }

            ServerMarkerController.append({
                uid: `${portal.uid}-gate-marker-${index}`,
                maxDistance: 15,
                color: markercolor,
                pos: gate.position,
                scale: { x: markersize, y: markersize, z: markersize },
                type: markertype,
                bobUpAndDown: markerbobUpAndDown,
                faceCamera: markerfaceCamera,
                rotate: markerrotate,
                dimension: dimension,
            });
        }

        gateInfo.shape = InteractionController.add({
            description: LOCALE_GATE_VIEW.LABEL_OPEN_PORTAL_MENU,
            position: gate.position,
            type: `portalgate`,
            identifier: `${portal.uid}-gate-interaction-${index}`,
            data: [portal.uid, index],
            callback: PortalSystem.showMenu,
            dimension: dimension,
        });

        // PortalSystem.refreshGateText(portal, index);
        return gateInfo;
    }

    /**
     * Add an portal to the database and system.
     * @static
     * @param {Portal} portal
     * @memberof PortalSystem
     */
    static async add(portal: Portal): Promise<string | null> {
        await PortalSystem.hasInitialized();

        if (!portal.uid) {
            portal.uid = sha256Random(JSON.stringify(portal));
        }

        if (portals.has(portal.uid)) {
            return null;
        }

        const document = await Database.insertData<Portal>(portal, PORTAL_COLLECTIONS.Portals, true);
        PortalSystem.create(document);

        alt.log(`~g~Created Portal: ${portal.uid}`);
        return portal.uid;
    }

    /**
     * Add an gate for existing portal to the database and system.
     * @static
     * @param {Portal} portal
     * @memberof PortalSystem
     */
    static async addGate(portal: Portal, gate: Gate): Promise<string | null> {
        await PortalSystem.hasInitialized();

        if (!portals.has(portal.uid)) {
            return null;
        }

        portal.gates.push(gate);
        await Database.updatePartialData(portal._id, { gates: portal.gates }, PORTAL_COLLECTIONS.Portals);

        let portalInfo = await PortalSystem.get(portal.uid);
        let newGate = PortalSystem.createGate(portalInfo, gate);
        portalInfo.gatesInternal.push(newGate);

        alt.log(`~g~Created Gate for Portal: ${portal.uid}`);
        return portal.uid;
    }

    /**
     * Generates text to display based on portal gate properties.
     * Refreshes label if present.
     * @private
     * @static
     * @param {Interior} interior
     * @memberof InternalSystem
     */
    static refreshGateText(portal: PortalInternal, index: number): void {
        // Begin Text Label Information
        let name = '';
        let gate = portal.gatesInternal[index];
        name += `${gate.name}`;

        if (!gate.isUnlocked) {
            name += NEW_LINE;
            name += `~r~${LOCALE_GATE_VIEW.LABEL_LOCKED}~w~`;
        }

        const aboveGroundOutside = {
            x: gate.position.x,
            y: gate.position.y,
            z: gate.position.z + 0.75,
        };

        ServerTextLabelController.remove(`${portal.uid}-gate-textlabel-${index}`);
        if (gate.removeTextLabel) {
            return;
        }

        ServerTextLabelController.append({
            uid: `${portal.uid}-gate-textlabel-${index}`,
            pos: aboveGroundOutside,
            data: name,
            maxDistance: 10,
        });
    }

    /**
     * A way to wait for initial portals to load from database
     * before attempting to add or remove any of them.
     * @static
     * @return {Promise<void>}
     * @memberof PortalSystem
     */
    static hasInitialized(): Promise<void> {
        return new Promise((resolve: Function) => {
            const interval = alt.setInterval(() => {
                if (isInitializing) {
                    return;
                }

                resolve();
                alt.clearInterval(interval);
            }, 100);
        });
    }

    /**
     * Get an portal based on uid.
     * @static
     * @param {string} uid
     * @return {Promise<Portal>}
     * @memberof PortalSystem
     */
    static async get(uid: string): Promise<PortalInternal> {
        await PortalSystem.hasInitialized();

        if (!portals.has(uid)) {
            return null;
        }

        return portals.get(uid);
    }

    /**
     * Get an portal based on name.
     * @static
     * @param {string} uid
     * @return {Promise<Portal>}
     * @memberof PortalSystem
     */
    static async getByName(name: string): Promise<PortalInternal> {
        await PortalSystem.hasInitialized();

        for (let [key, value] of portals.entries()) {
            if (value.name === name) return portals.get(key);
        }

        return null;
    }

    /**
     * Teleport to gate
     * @static
     * @param {alt.Player} player
     * @param {string} uid
     * @param {number} gateEntrance
     * @param {number} gateExit
     * @return {*}
     * @memberof PortalSystem
     */
    static async portToGate(player: alt.Player, uid: string, gateEntrance: number, gateExit: number) {
        if (!player || !player.valid || player.data.isDead || !uid) {
            return;
        }

        const portal = await PortalSystem.get(uid);
        if (!portal) {
            return;
        }

        let entrance = portal.gates[gateEntrance];
        let exit = portal.gates[gateExit];

        if (exit.ipl) {
            alt.emitClient(player, SYSTEM_EVENTS.IPL_LOAD, exit.ipl);
        }

        playerFuncs.set.frozen(player, true);

        if (!entrance.entity || entrance.entity === 'person' || (entrance.entity === 'all' && !player.vehicle)) {
            //Set Position with fade.
            player.setPortalPosition(exit.position.x, exit.position.y, exit.position.z);
        } else if (entrance.entity === 'vehicle' && player.vehicle) {
            //TODO Port only vehicle, not player.
        } else if (entrance.entity === 'all' && player.vehicle) {
            player.setPortalPositionKeepVehicle(exit.position.x, exit.position.y, exit.position.z);
        }

        // Freeze Player for exit gate Loading
        alt.setTimeout(() => {
            playerFuncs.set.frozen(player, false);
        }, 1000);
    }

    /**
     * Usually called internally to show a menu to the player.
     * This menu is called through the interaction controller.
     * @static
     * @param {alt.Player} player
     * @param {string} uid
     * @return {*}
     * @memberof PortalSystem
     */
    static async showMenu(player: alt.Player, uid: string, gateIndex: number) {
        if (!player || !player.valid || player.data.isDead || !uid) {
            return;
        }

        const portal = await PortalSystem.get(uid);
        if (!portal) {
            return;
        }

        const data = deepCloneObject<PortalInternal>(portal);
        for (let index = 0; index < portal.gatesInternal.length; index++) {
            delete portal.gatesInternal[index].players;
            delete portal.gatesInternal[index].shape;
            delete portal.gatesInternal[index].ipl;
        }

        //Jump if only two gates there, TODO: Show Admin menu, if admin has key in inventar.
        if (portal.gates.length == 2) {
            let entrance = gateIndex == 1 ? 1 : 0;
            let exit = gateIndex == 1 ? 0 : 1;

            PortalSystem.portToGate(player, uid, entrance, exit);
        } else {
            alt.emitClient(player, PORTAL_GATE_INTERACTIONS.SHOW_MENU, portal, gateIndex);
        }
    }
}
