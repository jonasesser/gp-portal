import * as alt from 'alt-server';
import { Vector3 } from '../../shared/interfaces/vector';

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
    inAnotherDimension?: boolean

    /**
     * Remove the inside colshape from creation process.
     * @type {boolean}
     * @memberof Interior
     */
    removeInsideColshape?: boolean;

    /**
     * Removes text from the outside instance.
     * @type {boolean}
     * @memberof Interior
     */
    removeTextLabel?: boolean;
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
     * @type {alt.Colshape}
     * @memberof InteriorInternal
     */
    shape?: alt.Colshape;

    /**
     * Players who were inside this interior.
     * May not always be accurate but should be pretty accurate.
     * @type {Array<number>}
     * @memberof InteriorInternal
     */
    players?: Array<number>;
}

