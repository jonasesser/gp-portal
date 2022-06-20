export enum PORTAL_COLLECTIONS {
    Portals = 'portals',
}

export enum GP_Portal_Enitities {
    Person = 'person',
    Vehicle = 'vehicle',
    All = 'all',
}

export enum PORTAL_GATE_INTERACTIONS {
    SWITCH = 'portal-gate:Switch',
    SHOW_MENU = 'portal-gate:Open:Menu',
    TOGGLE_LOCK = 'portal-gate:Toggle:Lock',
    ENTER = 'portal-gate:Enter',
    PORT = 'portal-gate:Port',
    REMOVE = 'portal-gate:Remove',
    SET_NAME = 'portal-gate:SetName',
    SET_PORTAL_NAME = 'portal:SetName',
}
