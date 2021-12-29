# altv-athena-plugin-portal

![Alt text](pic2.png?raw=true "portal plugin")

This Plugin creates portals where the player can port/beam from one place to another.

# Features

- Create Portal with two gates
- Choose markers and size
- Teleport fade effect
- Create Portals with multiple gates (e.g. for lifts)
- Player menu

# Features in progress

- Admin menu
- Dimension and IPL Support
- Key Support

# Installation

1. Get plugin here

https://mygp.gumroad.com/l/portalplugin
    
2. Copy Folder plugins/gpPortal/ to your athena project under src/core/plugins/
3. Import server plugin in src/core/plugins/imports.ts:

    ```import './gpPortal/index';```

4. Copy Folder client-plugins/gpPortal/ to your athena project under src/core/client-plugins/
5. Import client plugin in src/core/client-plugins/imports.ts:

    ```import './gpPortal/index';```


6. Copy Folder shared-plugins/gpPortal/ to your athena project under src/core/shared-plugins/


# Usage

1. In-Game as administrator

    ```/addportal [name] - Adds a portal at current position```

2. See video

https://youtu.be/7Nygyl0uFA0

3. Creation Menu

4. Admin Menu (Only visible if portal has more than 2 gates or admin has master key)

5. Player Menu (Only visible if portal has more than 2 gates)

![Alt text](playermenu.png?raw=true "player menu")



