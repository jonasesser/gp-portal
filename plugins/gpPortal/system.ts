import * as alt from 'alt-server';
import { PERMISSIONS } from '../../shared/flags/permissionFlags';
import ChatController from '../../server/systems/chat';
import Database from '@stuyk/ezmongodb';
import { PORTAL_COLLECTIONS, PORTAL_GATE_INTERACTIONS } from './enums';
import { Gate, GateInternal, Portal, PortalInternal } from './interfaces';
import { ServerMarkerController } from '../../server/streamers/marker';
import { InteractionController } from '../../server/systems/interaction';
import { LOCALE_GATE_VIEW } from './locales';
import { ServerTextLabelController } from '../../server/streamers/textlabel';
import { deepCloneObject } from '../../shared/utility/deepCopy';
import { sha256Random } from '../../server/utility/encryption';
import './cmds';
import { SYSTEM_EVENTS } from '../../shared/enums/system';
import { playerFuncs } from '../../server/extensions/Player';

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
            gatesInternal: new Array<GateInternal>()
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
            ...gate
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

        ServerMarkerController.append({
            uid: `${portal.uid}-gate-marker-${index}`,
            maxDistance: 15,
            color: new alt.RGBA(255, 255, 0, 75),
            pos: gate.position,
            scale: { x: 0.25, y: 0.25, z: 0.25 },
            type: 0,
        });

        gateInfo.shape = InteractionController.add({
            description: LOCALE_GATE_VIEW.LABEL_OPEN_PORTAL_MENU,
            position: gate.position,
            type: `portalgate`,
            identifier: `${portal.uid}-gate-interaction-${index}`,
            data: [portal.uid, index],
            callback: PortalSystem.showMenu,
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
            if (value.name === name)
                return portals.get(key);
        }

        return null;
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

        //TODO Show menu if Admin
        //TODO Show select menu if more than two gates
        //Jump if only two gates there
        if (portal.gates.length == 2) {
            let entrance = portal.gates[0];
            let exit = portal.gates[1];

            if (gateIndex == 1) {
                entrance = portal.gates[1];
                exit = portal.gates[0];
            }

            if (exit.ipl) {
                alt.emitClient(player, SYSTEM_EVENTS.IPL_LOAD, exit.ipl);
            }

            playerFuncs.set.frozen(player, true);
            playerFuncs.safe.setPosition(player, exit.position.x, exit.position.y, exit.position.z);

            // Freeze Player for exit gate Loading
            alt.setTimeout(() => {
                playerFuncs.set.frozen(player, false);
            }, 1000);
        } else {
            alt.emitClient(player, PORTAL_GATE_INTERACTIONS.SHOW_MENU, portal);
        }
    }

}