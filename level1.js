class Level1 extends GameplayScene {
    constructor() {
        super('level1');
    }

    onEnter() {
        // this.scene.start('level2')
        let topOb1 = this.addObstacle(700, this.h / 2  - 5, 1);
        let botOb1 = this.addObstacle(600, this.h - 10, 1);
        this.setFollow(botOb1, topOb1);

        this.botGate1 = this.addGate(1300, this.h - 10);

        this.addPlate(400, this.h / 2  - 5, [this.botGate1], "lower", false);

        // this.addPlate(1600, "bottom", topOb1, "raise", true);

        this.addObstacle(2000, this.h / 2  - 5, 1, false);

        this.addObstacle(2000, this.h - 10, 1, false);

        let topOb2 = this.addObstacle(2600, this.h / 2  - 5, 1);
        let botOb2 = this.addObstacle(2600, this.h - 10, 2);
        this.setFollow(topOb2, botOb2);

    }

    onTick() {
        // console.log(this.botGate1.height, this.botGate1.body.height);
    }
}