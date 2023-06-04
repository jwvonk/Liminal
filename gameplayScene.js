class GameplayScene extends Phaser.Scene {
    constructor() {
        super('gameplay');
    }

    preload() {
        this.load.path = "assets/";

        this.load.image('bg1', 'library computer desks.png');
        this.load.image('bg2', '2d library.png');
        this.load.image('bg3', 'pixel art library.png');

        this.load.image('book', 'book_placeholder.png');
        this.load.image('shelf', 'shelf_placeholder.png')

        // TODO: Change file name in path
        this.load.spritesheet("p1", "CharacterA-300px.png", {frameWidth: 925 / 6, frameHeight: 177});

        this.load.image('pc', 'CharacterA-0 copy.png');
        this.load.image('star', 'star_placeholder.png');

    }

    create() {
        // All dimensions/scales should be written in terms of these
        this.w = this.game.config.width;
        this.h = this.game.config.height;
        this.s = this.game.config.width * 0.01;

        // Set up background image instances
        for (let x = 0; x < this.w * 2; x += 600) {
            this.add.image(x, 0, 'bg1').setOrigin(0, 0).setScale(600/768)
            .setFlip(x % 1200 ? true : false);
            this.add.image(x, this.h / 2, 'bg1').setOrigin(0, 0).setScale(600/768)
            .setFlip(x % 1200 ? true : false);
        }

        // Set up cameras
        this.cam1 = this.cameras.main; // Top camera
        this.cam1.setSize(this.w, this.h / 2) // Restrict view to top half
        this.cam1.setBounds(0, 0, this.w * 2, this.h / 2) // Prevent from following players off screen

        this.cam2 = this.cameras.add(0, this.h / 2, this.w, this.h / 2); // Bottom camera
        this.cam2.scrollY = this.h / 2; // Restrict view to bottom half
        this.cam2.setBounds(0, this.h/2, this.w * 2, this.h / 2) // Prevent from following players off screen

        // Borders for both halves
        this.border  = this.physics.add.group({allowGravity: false, immovable: true});
        this.border.add(this.add.rectangle(0, this.h, this.w * 4, 10, 0x00000).setOrigin(0, 1));
        this.border.add(this.add.rectangle(0, this.h / 2, this.w * 4, 10, 0x000000).setOrigin(0, 0.5));
        this.border.add(this.add.rectangle(0, 0, this.w * 4, 10, 0x000000).setOrigin(0, 0));
        this.border.add(this.add.rectangle(0, 0, 10, this.h * 2, 0x000000).setOrigin(0, 0));
        this.border.add(this.add.rectangle(this.w * 2 + 150, 0, 10, this.h * 2, 0x000000).setOrigin(1, 0));

        // Players
        this.players = this.physics.add.group();
        this.player1 = this.players.create(150, 200, 'p1').setOffset(35, 5).setScale(.9).setSize(75/.9, 150/.9, false).setFrame(1);
        this.player2 = this.players.create(150, 800, 'p1').setOffset(0, 0).setScale(1).setSize(75, 150, false).setTint(0x87cdFF);

        this.anims.create ({
            key: 'player1Walk',
            frames: this.anims.generateFrameNumbers('p1', { frames: [0, 3] }),
            frameRate: 4,
        });

        // Tell cameras to follow players
        this.cam1.startFollow(this.player1, false, 1, 1, 0, 106);
        this.cam2.startFollow(this.player2, false, 1, 1, 0, 106);

        // Allow players to move in center of screen w/o camera follow
        this.cam1.setDeadzone(250, this.h / 2);
        this.cam2.setDeadzone(250, this.h / 2);

        // Obstacles
        this.obstacles = this.physics.add.group({allowGravity: false, DragX: 1000});
        this.gates = this.physics.add.group({allowGravity: false, immovable: true});

        this.plates = this.physics.add.group({allowGravity: false, immovable: true});

        // // all stars
        // this.stars = this.physics.add.group({allowGravity: false});
        // // Collectable stars for top half
        // this.topStars = this.physics.add.group({allowGravity: false});
        // // Collectable stars from bottom half
        // this.bottomStars = this.physics.add.group({allowGravity: false});

        // Collisions
        this.physics.add.collider(this.players, this.border);
        this.physics.add.collider(this.players, this.obstacles);
        this.physics.add.collider(this.players, this.gates);

        this.physics.add.overlap(this.players, this.stars, this.collectStar, null, this);

        this.physics.add.collider(this.players, this.plates, this.handlePlate, null, this);

        // Register Keyboard Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        this.onEnter();
    }

    // Add a collectable star at (x, y). Registered as being on `side` side.
    // addStar(x, y, side) { 
    //     let star = this.stars.create(x, y, 'star');
    //     if (side == "top") {
    //         this.topStars.add(star);
    //     } else if (side == "bottom") {
    //         this.bottomStars.add(star);
    //     }
    // }

    // Star Collision Event Handler
    // Opens gate on opposite side if all stars are collected on one side
    // collectStar(player, star) {
    //     star.disableBody(true, true);
    //     if (this.topStars.contains(star) && this.topStars.countActive() == 0) {
    //         this.gates.remove(this.gate2, true, true);
    //     }
    //     else if (this.bottomStars.contains(star) && this.topStars.countActive() == 0) {
    //         this.gates.remove(this.gate1, true, true);
    //     }
    // }

    // Adds a shelf obstacle to the level
    // x (float): x position of the shelf, in pixels
    // height (int): height of the shelf, in tiles
    // side (str): either "top" for the top side, or "bottom" for the bottom side
    // immovable (bool): whether this shelf is movable by either player
    addObstacle(x, height, side, immovable = true) {
        let obstacle;
        if (side == "top") {
            obstacle = this.add.tileSprite(x, this.h / 2  - 5, 150, 150 * height, 'shelf');
        } else if (side == "bottom") {
            obstacle = this.add.tileSprite(x, this.h - 5, 150, 150 * height, 'shelf');
        }
        obstacle.setOrigin(.5, 1);
        this.obstacles.add(obstacle);
        obstacle.body.setImmovable(immovable);
        return obstacle;
    }

    addGate(x, side) {
        let gate;
        if (side == "top") {
            gate = this.add.tileSprite(x, this.h / 2  - 5, 150, 450, 'shelf');
        } else if (side == "bottom") {
            gate = this.add.tileSprite(x, this.h - 5, 150, 450, 'shelf');
        }
        gate.setOrigin(.5, 1);
        this.gates.add(gate);
        gate.body.setImmovable(true);
        return gate;
    }

    // Set obj2 to move whenever obj1 moves
    // Makes obj2 immovable by the players, if not already
    setFollow(obj1, obj2) {
        obj2.body.setImmovable(true);
        obj2.setDataEnabled();
        obj2.setData('follow', obj1);
        // console.log(ob1);
        // this.physics.add.collider(this.players, this.ob1, () => {console.log(this.ob1.body.velocity); ob2.body.setVelocity(ob1.body.velocity.x)}, null, this);
        // this.physics.add.collider(this.players, this.ob1, ob1.body.setVelocity(ob2.body.velocity.x), null, this);
    }

    // Reduces the height of a shelf by 1 tile
    lowerObstacle(obstacle) {
        if (this.obstacles.contains(obstacle)) {
            if (obstacle.height > 150) {
                obstacle.height -= 150;
            }
        } else if (this.gates.contains(obstacle)) {
            obstacle.height = 0;
        }
    }
    raiseObstacle(obstacle) {
        if (this.obstacles.contains(obstacle)) {
            if (obstacle.height < 450) {
                obstacle.height += 150;
            }
        } else if (this.gates.contains(obstacle)) {
            obstacle.height = 450;
        }
    }

    // Adds a book pressure plate to the level
    // x (float): x position of the shelf, in pixels
    // height (int): height of the shelf, in tiles
    // target: the shelf obstacle this plate corresponds to
    // eff (str): whether the plate raises or lowers the shelf on first press
    //      either "raise" or "lower"
    // tog (bool): whether or not this plate is a toggle
    addPlate(x, side, target, eff, tog = false) {
        let plate;
        if (side == "top") {
            plate = this.plates.create(x, this.h / 2  - 5, 'book');
        } else if (side == "bottom") {
            plate = this.plates.create(x, this.h - 5, 'book');
        }
        plate.setOrigin(.5, 1);
        plate.setDataEnabled();
        plate.setData({target: target, eff: eff, tog: tog, pressed: false});
        return plate;
    }

    handlePlate(player, plate) {
        if (plate.body.touching.up && !plate.getData("pressed")) {
            plate.setData("pressed", true);
            let target = plate.getData("target");
            switch (plate.getData("eff") ) {
                case "raise":
                    this.raiseObstacle(target);
                    if (plate.getData("tog")) {
                        plate.setData("eff", "lower");
                    }
                    this.time.delayedCall(100, () => {
                        if (!plate.body.touching.up) {
                            if (!plate.getData("tog")) {
                                this.lowerObstacle(target);
                            }
                            plate.setData("pressed", false);
                        }
                    }, [], this);
                    break;
                case "lower":
                    this.lowerObstacle(target);
                    if (plate.getData("tog")) {
                        plate.setData("eff", "raise");
                    }
                    this.time.delayedCall(100, () => {
                        if (!plate.body.touching.up) {
                            if (!plate.getData("tog")) {
                                this.lowerObstacle(target);
                            }
                            plate.setData("pressed", false);
                        }
                    }, [], this);
                    break;
                default:
                    break;
            }
            
        }
    }
    

    update() {
        const { left, right, up } = this.cursors;

        if (left.isDown) {
            this.players.setVelocityX(-500); // Move left
            this.player1.setFlip(true);
            this.player1.play('player1Walk', true);
            this.player2.setFlip(true);
            this.player2.play('player1Walk', true);
        }
        else if (right.isDown) {
            this.players.setVelocityX(500); // Move right
            this.player1.setFlip(false);
            this.player1.play('player1Walk', true);
            this.player2.setFlip(false);
            this.player2.play('player1Walk', true);

        }
        else {
            this.players.setVelocityX(0); // Stand Still
            this.player1.setFrame()
        }

        if (up.isDown && this.player1.body.touching.down) // Player1 Grounded Check
        {
            this.player1.setVelocityY(-600); // Jump
        }

        if (up.isDown && this.player2.body.touching.down) // Player2 Grounded Check
        {
            this.player2.setVelocityY(-600); // Jump
        }

        // if (this.topStars.countActive() == 0) { // All top stars collected check
        //     // console.log("removed");
        //     // this.gates.remove(this.gate2, true, true); // Open bottom gate
        //     // this.gate2.destroy();
        // }

        // if (this.topStars.countActive() == 0) { // All bottom stars collected check
        //     // this.gate1.disableBody(true, true); // Open top gate
        // }

        // If players are both off screen, proceed to narrative scene
        if (this.player1.x > this.w * 2 + 100 && this.player2.x > this.w * 2 - 100) { 
            this.scene.start('narrative');
        }

        for (let obj of this.obstacles.getChildren()) {
            let f = obj.getData("follow");
            if (f) {
                obj.body.velocity = f.body.velocity;
            }
        }

        for (let plate of this.plates.getChildren()) {
            if (plate.getData("pressed") && !(plate.body.touching.up)) {
                if (!plate.getData("tog")) {
                    switch (plate.getData("eff") ) {
                        case "raise":
                            this.lowerObstacle(plate.getData("target"));
                            break;
                        case "lower":
                            this.raiseObstacle(plate.getData("target"));
                            break;
                        default:
                            break;
                    }
                }
                plate.setData("pressed", false);
            }
        }
    }

    onEnter() {
        console.warn('This GameplayScene did not implement onEnter():', this.constructor.name);
    }
}

