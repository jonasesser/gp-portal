import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import Database from '@stuyk/ezmongodb';

import './cmds';
import './prototypes';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { deepCloneObject } from '../../../shared/utility/deepCopy';
import { PORTAL_COLLECTIONS, PORTAL_GATE_INTERACTIONS, GP_Portal_Enitities } from '../shared/enums';
import { GP_Events_Portal } from '../shared/events';
import { PortalInternal, Portal, GateInternal, Gate } from '../shared/interfaces';
import { LOCALE_GATE_VIEW } from '../shared/locales';
import { sha256Random } from '@AthenaServer/utility/hash';
import { getForwardVector } from '@AthenaShared/utility/vector';

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
            alt.logWarning('[GPPORTAL] PortalInfo gate dimension: ' + gateInfo.dimension);
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

        gateInfo.dimension = 0;
        if (gateInfo.inAnotherDimension) {
            gateInfo.dimension = nextDimension;
            // Increment dimension for next gate added.
            nextDimension += 1;
            alt.logWarning('[GPPORTAL] Gate Dimension: ' + gateInfo.dimension);
        }

        portal._id = portal._id.toString();

        //defaults
        let markertype = 0;
        let markersize = 0.25;
        let markercolor = new alt.RGBA(255, 255, 0, 75);
        let markerbobUpAndDown = false;
        let markerfaceCamera = false;
        let markerrotate = false;
        let isPlayerOnly = true;
        let isVehicleOnly = false;
        let triggerOnEnter = false;
        let gaterange = 1;

        if (gateInfo.triggerOnEnter) {
            triggerOnEnter = true;
        }

        if (gateInfo.markertype) markertype = gateInfo.markertype;
        if (gateInfo.markersize) markersize = gateInfo.markersize;
        if (gateInfo.markercolor)
            markercolor = new alt.RGBA(
                gateInfo.markercolor[0],
                gateInfo.markercolor[1],
                gateInfo.markercolor[2],
                gateInfo.markercolor[3],
            );
        if (gateInfo.markerbobUpAndDown) markerbobUpAndDown = gateInfo.markerbobUpAndDown;
        if (gateInfo.markerfaceCamera) markerfaceCamera = gateInfo.markerfaceCamera;
        if (gateInfo.markerrotate) markerrotate = gateInfo.markerrotate;
        if (gateInfo.entity === GP_Portal_Enitities.Vehicle) {
            isPlayerOnly = false;
            isVehicleOnly = true;
        } else if (gateInfo.entity === GP_Portal_Enitities.All) {
            isPlayerOnly = false;
        }
        if (gateInfo.range) gaterange = gateInfo.range;

        if (!gateInfo.hidden) {
            //Z correction for some markers
            let markerposition = null;
            if ([1, 8, 9, 23, 25, 26, 27, 28, 43].includes(gateInfo.markertype)) {
                markerposition = { x: gateInfo.position.x, y: gateInfo.position.y, z: gateInfo.position.z + 0.02 };
            } else {
                markerposition = { x: gateInfo.position.x, y: gateInfo.position.y, z: gateInfo.position.z + 0.5 };
            }

            Athena.controllers.marker.append({
                uid: `${portal.uid}-gate-${gateInfo.name}-marker-${index}`,
                maxDistance: 15,
                color: markercolor,
                pos: markerposition,
                scale: { x: markersize, y: markersize, z: markersize },
                type: markertype,
                bobUpAndDown: markerbobUpAndDown,
                faceCamera: markerfaceCamera,
                rotate: markerrotate,
                dimension: gateInfo.dimension,
            });
        }

        gateInfo.shape = Athena.controllers.interaction.append({
            description: LOCALE_GATE_VIEW.LABEL_OPEN_PORTAL_MENU,
            position: gateInfo.position,
            uid: `${portal.uid}-gate-${gateInfo.name}-interaction-${index}`,
            data: [portal.uid, index],
            callback: PortalSystem.showMenu,
            dimension: gateInfo.dimension,
            range: gaterange,
            isVehicleOnly: isVehicleOnly,
            isPlayerOnly: isPlayerOnly,
            triggerCallbackOnEnter: triggerOnEnter,
            debug: false,
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

        //TODO: Fix this
        // ServerTextLabelController.remove(`${portal.uid}-gate-${gate.name}-textlabel-${index}`);
        // if (gate.removeTextLabel) {
        //     return;
        // }

        // ServerTextLabelController.append({
        //     uid: `${portal.uid}-gate-${gate.name}-textlabel-${index}`,
        //     pos: aboveGroundOutside,
        //     data: name,
        //     maxDistance: 10,
        // });
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
     * @param {GateInternal} gateEntrance
     * @param {GateInternal} gateExit
     * @return {*}
     * @memberof PortalSystem
     */
    static async portToGate(player: alt.Player, uid: string, entranceIndex: number, exitIndex: number) {
        if (!player || !player.valid || player.data.isDead || !uid) {
            return;
        }

        const portal = await PortalSystem.get(uid);
        if (!portal) {
            return;
        }

        let entrance = portal.gatesInternal[entranceIndex];
        let exit = portal.gatesInternal[exitIndex];

        if (exit.ipl) {
            alt.emitClient(player, SYSTEM_EVENTS.IPL_LOAD, exit.ipl);
        }

        player.frozen = true;

        let exitposition = new alt.Vector3(exit.position.x, exit.position.y, exit.position.z + 0.75);
        let exitrotation = null;
        if (exit.rotation) {
            exitrotation = new alt.Vector3(exit.rotation.x, exit.rotation.y, exit.rotation.z);
        } else if (player.vehicle) {
            exitrotation = player.vehicle.rot;
        } else {
            exitrotation = player.rot;
        }

        let exitrange = 1;
        if (exit.range) {
            exitrange = exit.range;
        }

        if (exit.triggerOnEnter) {
            //Move player out of range
            // exit.range;
            alt.logWarning('change exit exitposition');
            alt.logWarning('change exit exitposition:' + exitposition);

            const forwardVector = getForwardVector(exitrotation);
            exitposition = new alt.Vector3(
                exitposition.x + forwardVector.x * (exitrange + 0.1),
                exitposition.y + forwardVector.y * (exitrange + 0.1),
                exitposition.z,
            );

            alt.logWarning('change exit exitposition:' + exitposition);
        }

        if (!entrance.entity || entrance.entity === 'person' || (entrance.entity === 'all' && !player.vehicle)) {
            //Set Position with fade.
            player.setPortalPosition(exitposition, exitrotation, exit.dimension, entrance.effect);
        } else if (entrance.entity === 'vehicle' && player.vehicle) {
            //Set vehicle position only - no fade.
            let vehicle = player.vehicle;
            //TODO: Emit to all player in the vehicle
            alt.emitClient(player, GP_Events_Portal.LeaveVehicle);
            alt.setTimeout(async () => {
                vehicle.pos = exitposition;
                vehicle.rot = exitrotation;
                vehicle.dimension = exit.dimension;
            }, 3000);
        } else if (entrance.entity === 'all' && player.vehicle) {
            if (exit.experimentalgate) {
                if (exit.experimentalgate === 'speed') {
                    player.setPortalPositionKeepVehicleWithVelocity(
                        exitposition,
                        exitrotation,
                        player.vehicle.velocity,
                        1,
                        exit.dimension,
                        entrance.effect,
                    );
                } else if (exit.experimentalgate === 'boost') {
                    player.setPortalPositionKeepVehicleWithVelocity(
                        exitposition,
                        exitrotation,
                        player.vehicle.velocity,
                        3,
                        exit.dimension,
                        entrance.effect,
                    );
                }
            }

            if (!exit.experimentalgate || exit.experimentalgate === 'none') {
                player.setPortalPositionKeepVehicle(exitposition, exitrotation, exit.dimension, entrance.effect);
            }
        }

        // Freeze Player for exit gate Loading
        alt.setTimeout(() => {
            player.frozen = false;
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
