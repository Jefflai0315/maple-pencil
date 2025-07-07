import * as Phaser from "phaser";

export class LoadingScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
  private clouds: Phaser.GameObjects.Sprite[] = [];
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {
    // Load minimal assets for loading scene
    this.load.image("player_loading", "/sprites/smile/0/jump_0.png");
    this.load.image("sky", "/BG/BG_sky.png");

    // Add loading error handler
    this.load.on("loaderror", (file: { src: string }) => {
      console.error("Error loading file:", file.src);
    });
  }

  create() {
    // Set background color first to prevent black screen
    this.cameras.main.setBackgroundColor("#87CEEB"); // Sky blue

    try {
      // Add sky background
      const sky = this.add.tileSprite(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        "sky"
      );
      sky.setOrigin(0, 0);
      sky.setScrollFactor(0);
      sky.setScale(2);
    } catch {
      console.warn("Could not load sky background, using color only");
    }

    // Create clouds
    this.createClouds();

    // Create player (falling from sky)
    try {
      this.player = this.add.sprite(
        this.cameras.main.width / 2,
        -200, // Start above screen
        "player_loading"
      );
      this.player.setScale(2);
      this.player.setTint(0xffffff);
    } catch {
      console.warn("Could not load player sprite, creating placeholder");
      // Create a simple placeholder if sprite fails to load
      const placeholder = this.add.rectangle(
        this.cameras.main.width / 2,
        -100,
        30,
        30,
        0xffffff
      );
      // Convert to sprite-like object for compatibility
      this.player = placeholder as Phaser.GameObjects.Rectangle;
    }

    // Create loading text
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      "Loading...",
      {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 4,
      }
    );
    this.loadingText.setOrigin(0.5);

    // Create progress bar background
    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0xffffff, 0.3);
    this.progressBar.fillRect(
      this.cameras.main.width / 2 - 150,
      this.cameras.main.height / 2 + 150,
      300,
      20
    );

    // Create progress text
    this.progressText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 180,
      "0%",
      {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 2,
      }
    );
    this.progressText.setOrigin(0.5);

    // Start falling animation
    this.startFallingAnimation();

    // Simulate loading progress
    this.simulateLoading();
  }

  private createClouds() {
    // Create simple cloud shapes
    const cloudPositions = [
      { x: 100, y: 80, scale: 0.8 },
      { x: 300, y: 120, scale: 1.2 },
      { x: 500, y: 60, scale: 0.6 },
      { x: 700, y: 100, scale: 1.0 },
    ];

    cloudPositions.forEach((pos, index) => {
      const cloud = this.createSimpleCloud(pos.x, pos.y, pos.scale);
      this.clouds.push(cloud);

      // Add gentle floating animation
      this.tweens.add({
        targets: cloud,
        y: pos.y + 10,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: index * 500,
      });
    });
  }

  private createSimpleCloud(
    x: number,
    y: number,
    scale: number
  ): Phaser.GameObjects.Sprite {
    // Create a simple cloud using graphics
    const cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xffffff, 0.8);

    // Draw cloud shape
    cloudGraphics.fillEllipse(x, y, 60 * scale, 30 * scale);
    cloudGraphics.fillEllipse(x - 20 * scale, y, 40 * scale, 25 * scale);
    cloudGraphics.fillEllipse(x + 20 * scale, y, 40 * scale, 25 * scale);
    cloudGraphics.fillEllipse(x, y - 10 * scale, 50 * scale, 20 * scale);

    // Generate texture key
    const textureKey = `cloud_${x}_${y}`;
    cloudGraphics.generateTexture(textureKey, 120 * scale, 60 * scale);
    cloudGraphics.destroy();

    return this.add.sprite(x, y, textureKey);
  }

  private startFallingAnimation() {
    // Player falling animation
    this.tweens.add({
      targets: this.player,
      y: this.cameras.main.height / 2 - 50,
      duration: 2000,
      ease: "Bounce.easeOut",
      onComplete: () => {
        // Add gentle bouncing after landing
        this.tweens.add({
          targets: this.player,
          y: this.cameras.main.height / 2 - 30,
          duration: 500,
          yoyo: true,
          repeat: 1,
          ease: "Sine.easeInOut",
        });
      },
    });

    // Add rotation during fall
    this.tweens.add({
      targets: this.player,
      angle: 360,
      duration: 2000,
      ease: "Linear",
    });
  }

  private simulateLoading() {
    let progress = 0;
    const progressBar = this.add.graphics();

    const updateProgress = () => {
      progress += Math.random() * 15 + 5; // Random progress increment

      if (progress > 100) {
        progress = 100;
      }

      // Update progress bar
      progressBar.clear();
      progressBar.fillStyle(0x4caf50, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 150,
        (300 * progress) / 100,
        20
      );

      // Update progress text
      this.progressText.setText(`${Math.round(progress)}%`);

      // Add loading dots animation
      const dots = ".".repeat(Math.floor(progress / 20) + 1);
      this.loadingText.setText(`Loading${dots}`);

      if (progress < 100) {
        // Continue loading
        this.time.delayedCall(Math.random() * 200 + 100, updateProgress);
      } else {
        // Loading complete, transition to main scene
        this.time.delayedCall(500, () => {
          this.scene.start("MainScene");
        });
      }
    };

    updateProgress();
  }
}
