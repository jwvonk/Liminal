let config = {
    type: Phaser.WEBGL,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1200
    },
    backgroundColor: 0x000000,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 1200},
            debug: false,
        }
    },
    scene: [Title, Intro, Level1, Dialogue1, Level2, Dialogue2, Level3, Dialogue3, End, Pause,]
}

let game = new Phaser.Game(config);