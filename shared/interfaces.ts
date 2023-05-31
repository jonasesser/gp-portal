import { Vector3 } from 'alt-shared';

export interface Gate {
    /**
     * The name of the gate.
     * @type {string}
     * @memberof Gate
     */
    name: string;

    /**
     * The location for the portal gate
     * @type {Vector3}
     * @memberof Gate
     */
    position: Vector3;

    /**
     * The rotation for the portal gate exit
     * @type {Vector3}
     * @memberof Gate
     */
    rotation?: Vector3;

    /**
     * Optional IPL to associate with this gate.
     * @type {string}
     * @memberof Gate
     */
    ipl?: string;

    /**
     * Is this portals gate currently unlocked?
     * @type {boolean}
     * @memberof Gate
     */
    isUnlocked?: boolean;

    /**
     * Is this portals gate in another dimension?
     * @memberof Gate
     */
    inAnotherDimension?: boolean;

    /**
     * Removes text from the outside instance.
     * @type {boolean}
     * @memberof Gate
     */
    removeTextLabel?: boolean;

    /**
     * Marker type
     * @type {number}
     * @memberof Gate
     */
    markertype?: number;

    /**
     * Marker size
     * @type {number}
     * @memberof Gate
     */
    markersize?: number;

    /**
     * Marker color
     * @type {number}
     * @memberof Gate
     */
    markercolor?: number[];

    /**
     * Should the marker be slightly animated.
     * @type {boolean}
     * @memberof Gate
     */
    markerbobUpAndDown?: boolean;

    /**
     * Should the marker face the player's camera.
     * @type {boolean}
     * @memberof Gate
     */
    markerfaceCamera?: boolean;

    /**
     * Should the marker rotate to face the player.
     * @type {boolean}
     * @memberof Gate
     */
    markerrotate?: boolean;

    /**
     * Range of the interaction
     * @type {boolean}
     * @memberof Gate
     */
    range?: number;

    /**
     * Removes the marker from creation process.
     * @type {boolean}
     * @memberof Gate
     */
    hidden?: boolean;

    /**
     * The entity that can use this gate.
     * @type {number}
     * @memberof Gate
     */
    entity?: string;

    experimentalgate?: string;

    triggerOnEnter?: boolean;

    /**
     * portal teleport effect name
     */
    effect?: string;
}

export interface Portal {
    /**
     * The database entry id for this portal
     * @type {unknown}
     * @memberof Portal
     */
    _id?: unknown;

    /**
     * A unique identifier for this portal.
     * It can be any string but there is an automatic generator if this is not supplied.
     *
     * @type {string}
     * @memberof Portal
     */
    uid?: string;

    /**
     * The name of the portal.
     * @type {string}
     * @memberof Portal
     */
    name: string;

    /**
     * The portal gates
     * @type {Vector3}
     * @memberof Portal
     */
    gates: Gate[];

    /**
     * The owner of this property.
     * @type {string}
     * @memberof Portal
     */
    owner?: string;

    /**
     * A list of unique identifiers to create 'keys' for this portal.
     * @type {Array<string>}
     * @memberof Portal
     */
    keys?: Array<string>;
}

export interface PortalInternal extends Portal {
    /**
     * The location for the portal gate
     * @type {Vector3}
     * @memberof Portal
     */
    gatesInternal?: GateInternal[];
}

export interface GateInternal extends Gate {
    /**
     * Automatically generated dimension for this gate.
     * @type {number}
     * @memberof Gate
     */
    dimension?: number;

    /**
     * The share used for the gate.
     * @type {string}
     * @memberof InteriorInternal
     */
    shape?: string;

    /**
     * Players who were inside this interior.
     * May not always be accurate but should be pretty accurate.
     * @type {Array<number>}
     * @memberof InteriorInternal
     */
    players?: Array<number>;
}
