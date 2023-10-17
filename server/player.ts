import * as charRef from '../../../shared/interfaces/character';

// Extends the player interface.
declare module 'alt-server' {
    export interface Player {
        /**
         * The minimum 'z' below the interior that the player can go before
         * they have their dimension reset.
         * @type {number}
         * @memberof Player
         */
        interiorMinimumZ?: number;
    }

    export interface Character extends Partial<charRef.Character> {
        /**
         * The portal uid that this player belongs to atm.
         * Also used as a way to tell if a player is in an portal/interior.
         * @type {(null | undefined | string)}
         * @memberof Character
         */
        portalUID?: null | undefined | string;
        portalEntraceIndex?: null | number;
        portalExitIndex?: null | number;
    }
}
