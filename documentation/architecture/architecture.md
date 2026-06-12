# Architecture
This document describes how the application basically works and the different Scenes and States of the Application. It serves as the entrypoint of this applications documentation.



## Folder Structure
```
Tractor2/
├── art/
│   ├── animations/ *single images of animatd assets in the game*
│   ├── assets/ *single images used for non animated assets in the game*
│   ├── spritesheet/ *texturepacker files used to make spritesheets for the game assets*
│   ├── ui/ *single images used for the ui components*
│   └── ui_ingame/ *single images used for the ingame ui*
├── assets/ *holds the assets actually required during runtime*
│   ├── audio/
│   ├── icons/
│   ├── spritesheets/
│   └── styles/
├── documentation/ *documentation of this project*
├── src/
│   ├── interfaces/
│   ├── misc/
│   ├── objects/
│   │   └── base/
│   ├── scenes/
│   └── states/
└── dist/ *output folder*
```

## Scenes

### BootScene
Loads the most basic assets and is responsible for any boot tasks concerning the game

### LoadingScene
Loads the necessary resources to run the game

### MenuScene
Displays the menu and is responsible for displaying settings concerning the game and allows to start a new game.
Available Actions are:

- "new game": Starts a new game

- "settings": Allows to change the default settings of the game.
  - "field size": Allows to change the tilesize of the field that needs to be harvested

### PlayScene
Implements a state machine interface and updates & displays the game.

For the implementation details of statemachine consult: 

States of the game are:

#### CountDownState
Counts down from 3 to 0 and then switches to PlayState

#### MenuState
Displays the control scheme at the beging of the Game. Switches to CountDownState when closed.

#### PlayState
Updates the logic in PlayScene and runs the game.
