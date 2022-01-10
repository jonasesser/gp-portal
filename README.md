# altv-athena-plugin-portal

![Alt text](pic2.png?raw=true "portal plugin")

This Plugin creates portals where the player can port/beam from one place to another.

# Version Update Information

Current Version: 1.1

If you update from Version 1.0 to 1.1 you must change the y-axis for all already existing portals.
new y-axis = old-y - 1;

# Features

- Create Portal with two gates
- Choose markers and size
- Teleport fade effect
- Create Portals with multiple gates (e.g. for lifts)
- Player menu
- Select Entity which can use the gate (Person, Vehicle or All/Both)
- Select Exit Rotation
- Expermmental Gates
    - Speed Gate (Exit Speed = Enter Speed)
    - Speed Boost Gate (Exit Speed = 3 x Enter Speed)


# Upcoming Features

- Admin menu
- Dimension and IPL Support
- Key Support
- Portals without the need to press E

See issue tracker for more informations.

# Installation

1. Get plugin here

https://mygp.gumroad.com/l/portalplugin
    
2. Copy Folder server-plugins/gpPortal/ to your athena project under src/core/server-plugins/
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

# Feedback

If you have any feedback raise an issue or reach me in discord at https://discord.gg/UNw2tfbbeZ

"Starring a repository also shows appreciation to the repository maintainer for their work. 
Many of GitHub's repository rankings depend on the number of stars a repository has."
-> So give me a star ;-) 



