import * as Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private isJumping: boolean = false;
  private hasDoubleJumped: boolean = false;
  private faceLeft: boolean = false;
  private isProne: boolean = false;
  private isAttacking: boolean = false;
  private showDebugBoxes: boolean = true;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private xKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private jumpCooldown = 0;
  private worldWidth = 1500; // Increased world width
  private minimap!: Phaser.GameObjects.Graphics;
  private playerDot!: Phaser.GameObjects.Graphics;
  private minimapMap!: Phaser.GameObjects.Graphics; // Graphics for the map layout
  private minimapWidth = 180;
  private minimapHeight = 100;
  // Change background layers to regular sprites
  private backgroundLayers: Phaser.GameObjects.Sprite[] = [];
  private layerPositions: number[] = [0, 0, 0, 0]; // Store initial positions
  private backgroundMusic!:
    | Phaser.Sound.BaseSound
    | Phaser.Sound.WebAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.NoAudioSound;
  private isMusicPlaying: boolean = false;
  private interactionText: Phaser.GameObjects.Text | undefined;
  private interactionText2: Phaser.GameObjects.Text | undefined;
  private eKeyPressed: boolean = false;
  private interactionText3: Phaser.GameObjects.Text | undefined;

  // Touch controls
  private joystick!: Phaser.GameObjects.Container;
  private joystickBase!: Phaser.GameObjects.Graphics;
  private joystickThumb!: Phaser.GameObjects.Graphics;
  private joystickActive: boolean = false;
  private joystickPosition: { x: number; y: number } = { x: 0, y: 0 };
  private joystickPointerId: number | null = null; // Track which pointer started the joystick
  private jumpButton!: Phaser.GameObjects.Container;
  private isMobile: boolean = false;
  private jumpButtonPressed: boolean = false;
  private lastPointerPosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastJumpTime: number = 0;
  private jumpCooldownTime: number = 200; // 300ms cooldown between jumps

  // Minimap container properties
  private minimapContainer!: Phaser.GameObjects.Container;
  private minimapTitleBar!: Phaser.GameObjects.Container;
  private minimapContent!: Phaser.GameObjects.Container;
  private minimapBackground!: Phaser.GameObjects.Graphics;
  private minimapTitle!: Phaser.GameObjects.Text;
  private minimapLocation!: Phaser.GameObjects.Text;
  private minimapToggleButton!: Phaser.GameObjects.Text;
  private isMinimapOpen: boolean = true;
  private minimapContainerWidth = 220;
  private minimapContainerHeight = 140;
  private titleBarHeight = 40;
  private minimapDragOffsetX: number = 0;
  private minimapDragOffsetY: number = 0;
  private mapScaleX = 1;
  private mapScaleY = 1;
  // Remove VIRTUAL_HEIGHT, keep VIRTUAL_WIDTH for world width
  // private static readonly VIRTUAL_HEIGHT = 720;
  private static readonly WORLD_WIDTH = 1500;
  private static readonly WORLD_HEIGHT = 720;
  private backgroundParallax: number[] = [];
  private backgroundBaseX: number[] = []; // Store base X for each background layer
  private isMinimapDragging: boolean = false; // Track if minimap is being dragged

  constructor() {
    super({ key: "MainScene" });
  }

  private handleNPCPopupParameters() {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const npcPopup = urlParams.get("npc");

      if (npcPopup) {
        // Open NPC popup after a short delay to ensure scene is fully initialized
        this.time.delayedCall(1000, () => {
          this.openNPCPopup(npcPopup);
        });
      }
    }
  }

  private openNPCPopup(npcType: string) {
    switch (npcType.toLowerCase()) {
      case "sketch":
      case "sketch_canvas":
        this.openSketchCanvas();
        break;
      case "webcam":
      case "photo":
      case "photobooth":
        this.openWebcamCapture();
        break;
      case "artrace":
      case "ar":
      case "ar_trace":
        this.openARTraceTool();
        break;
      default:
        console.warn(`Unknown NPC popup type: ${npcType}`);
    }
  }

  // Public method to open NPC popups programmatically
  public openNPCPopupFromExternal(npcType: string) {
    this.openNPCPopup(npcType);
  }

  // Resize the body and keep the feet (bottom) aligned to the sprite's bottom.
  private resizeBodyKeepFeet(newHeight: number) {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const newH = Math.max(20, Math.floor(newHeight)); // safety clamp
    body.setSize(body.width, newH, false);
    // Origin is (0.5, 1) so sprite.bottom is at player.y.
    // Set offset so body.bottom == sprite.bottom:
    body.setOffset(body.offset.x, this.player.displayHeight - newH);
  }

  // After any texture/frame change (e.g., switching to prone0), call this to
  // re-sync the offset in case the frame’s displayHeight changed.
  private resyncOffsetToFrame() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setOffset(body.offset.x, this.player.displayHeight - body.height);
  }

  preload() {
    // Add loading error handler
    this.load.on("loaderror", (file: { src: string }) => {
      console.error("Error loading file:", file.src);
    });

    // Add audio loading error handler
    this.load.on("audioerror", (file: { src: string }) => {
      console.error("Error loading audio file:", file.src);
    });

    // Add file complete handler
    this.load.on("filecomplete", (key: string) => {
      console.log("File loaded successfully:", key);
    });

    // Add load complete handler
    this.load.on("complete", () => {
      console.log("All assets loaded successfully");
    });

    // Load NPC
    this.load.image("npc_sketch", "/NPC/Sketch_booth2.png");
    this.load.image("npc_sketch2", "/NPC/photobooth.png");
    this.load.image("npc_video", "/NPC/Video_booth.png");
    this.load.image("npc_camera", "/NPC/Camera.png");

    // Load sky tile
    this.load.image("sky", "/BG/BG_sky.png");

    // Load walking frames
    for (let i = 0; i <= 4; i++) {
      this.load.image(`walk${i}`, `/sprites/smile/0/walk1_${i}.png`);
    }

    // Load standing frames
    for (let i = 0; i <= 3; i++) {
      this.load.image(`stand${i}`, `/sprites/smile/0/stand1_${i}.png`);
    }

    // Load jump frames
    for (let i = 0; i <= 1; i++) {
      this.load.image(`jump${i}`, `/sprites/smile/0/jump_${i}.png`);
    }

    // Load prone frame
    this.load.image("prone0", "/sprites/smile/0/prone_0.png");

    // Add load complete handler for prone sprite
    this.load.on("filecomplete", (key: string) => {
      if (key === "prone0") {
        console.log("Prone sprite loaded successfully");
      }
    });

    // Load attack frames
    for (let i = 0; i <= 3; i++) {
      this.load.image(`swingP1_${i}`, `/sprites/smile/0/swingP1_${i}.png`);
    }

    // Load game assets
    // Load tiles
    for (let i = 1; i <= 3; i++) {
      this.load.image(`DRT_top${i}`, `/tiles/DRT_top${i}.png`);
      this.load.image(`DRT_middle${i}`, `/tiles/DRT_middle${i}.png`);
      this.load.image(`DRT_bottom${i}`, `/tiles/DRT_bottom1.png`); //bottom 1 is working well
    }
    this.load.image("DRT_slope_top", "/tiles/DRT_slope_top.png");
    this.load.image("DRT_slope_bottom", "/tiles/DRT_slope_bottom.png");

    // Load background layers
    this.load.image("bg_layer1", "/BG/CDB.png");
    this.load.image("bg_layer2", "/BG/HDB.png");
    this.load.image("bg_layer3", "/BG/Merlion.png");
    this.load.image("bg_layer4", "/BG/Building_FG.png");

    // Load background music with proper error handling
    try {
      // Try to load the audio file
      this.load.audio("bgm", "/audio/CBD_town.mp3");
    } catch (error) {
      console.error("Error loading audio file:", error);
    }

    console.log("Assets loaded");
  }

  create() {
    console.log("Creating game scene...");

    try {
      // Initialize background music immediately
      this.initializeAudio();

      // Add sky tile (non-scrolling)
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

      // --- Set a large world width for horizontal scrolling ---
      this.physics.world.setBounds(
        0,
        0,
        this.worldWidth,
        this.cameras.main.height
      );
      this.cameras.main.setBounds(
        0,
        0,
        this.worldWidth,
        this.cameras.main.height
      );

      // --- Responsive Ground ---
      const groundY = this.cameras.main.height - 50; // 50px from the bottom
      const groundWidth = this.worldWidth; // Full world width
      const groundHeight = 100;
      const ground = this.add.rectangle(
        groundWidth / 2,
        groundY + groundHeight / 2,
        groundWidth,
        groundHeight - 10,
        0x000000
      );
      this.physics.add.existing(ground, true);

      // --- Responsive Background Layers: parallax, always at % of world width ---
      // Create a temporary background sprite to get its height
      const tempBg = this.add.sprite(0, 0, "bg_layer1");
      const backgroundHeight = tempBg.height;
      tempBg.destroy(); // Remove the temp sprite
      // Position backgrounds so their bottom sits on top of the ground
      const bgY = groundY - backgroundHeight;
      // Store base X for each background (10%, 20%, 40%, 80% of world width)
      this.backgroundBaseX = [
        this.worldWidth * 0.3,
        this.worldWidth * 0.75,
        this.worldWidth * 0.5,
        this.worldWidth * 0.05,
      ];
      this.backgroundLayers = [
        this.add
          .sprite(this.backgroundBaseX[0], bgY, "bg_layer1")
          .setOrigin(0.5, -0.05)
          .setScrollFactor(0, 0),
        this.add
          .sprite(this.backgroundBaseX[1], bgY, "bg_layer2")
          .setOrigin(0.5, 0)
          .setScrollFactor(0, 0),
        this.add
          .sprite(this.backgroundBaseX[2], bgY, "bg_layer3")
          .setOrigin(0.5, -0.8)
          .setScrollFactor(0, 0),
        this.add
          .sprite(this.backgroundBaseX[3], bgY, "bg_layer4")
          .setOrigin(0.5, 0)
          .setScrollFactor(0, 0),
      ];
      this.backgroundParallax = [0.2, 0.4, 0.6, 0.8];

      // --- Player Spawn ---
      const spawnX = this.worldWidth * 0.1; // 10% from left of world
      const spawnY = groundY - 70;
      this.player = this.physics.add.sprite(spawnX, spawnY, "stand0");
      this.player.setOrigin(0.5, 1); // bottom-center = feet anchor
      this.player.setCollideWorldBounds(true);
      this.player.setGravityY(300);
      this.player.flipX = true;
      this.faceLeft = false;
      this.physics.add.collider(this.player, ground);

      // Create debug graphics for bounding boxes
      // this.debugGraphics = this.add.graphics();
      // this.debugGraphics.setScrollFactor(0); // Keep debug boxes on screen

      // Slope
      const slopeStartX = 6 * 90 + 30; // wherever your slope starts
      const slopeStepHeight = 1;
      const stepWidth = 1.5;
      const stepCount = 90 / stepWidth;

      for (let i = 0; i < stepCount; i++) {
        const x = slopeStartX + i * stepWidth;
        const y = groundY - (i + 1) * slopeStepHeight;
        const step = this.add.rectangle(
          x + 45,
          y,
          90,
          slopeStepHeight - 10,
          0x00ff00,
          0
        ); // invisible
        this.physics.add.existing(step, true);
        this.physics.add.collider(this.player, step);
      }

      // Top of slope
      const topSlopeWidth = 90 * 20;
      const topSlope = this.add.rectangle(
        slopeStartX + stepCount * stepWidth + topSlopeWidth / 2,
        groundY - stepCount * slopeStepHeight,
        topSlopeWidth,
        slopeStepHeight - 10,
        0x000000,
        0
        // invisible
      );
      this.physics.add.existing(topSlope, true);
      this.physics.add.collider(this.player, topSlope);

      // --- Overlay decorative tiles (no physics) ---
      let x = 0;
      const tileWidth = 89;
      // Helper to place a flat set
      const placeFlatSet = (setNum: number, yOffset: number) => {
        this.add.image(
          x + tileWidth / 2,
          groundY + 20 + yOffset,
          `DRT_top${setNum}`
        );
        this.add.image(
          x + tileWidth / 2,
          groundY + 60 + yOffset,
          `DRT_middle${setNum}`
        );
        this.add.image(
          x + tileWidth / 2,
          groundY + 109 + yOffset,
          `DRT_bottom${setNum}`
        );
        x += tileWidth;
      };
      // Helper to place a slope set
      const placeSlope = (yOffset: number) => {
        this.add.image(
          x + tileWidth / 2,
          groundY + 25 + yOffset,
          "DRT_slope_top"
        );
        this.add.image(
          x + tileWidth / 2,
          groundY + 120 + yOffset,
          "DRT_slope_bottom"
        );
        x += tileWidth;
      };

      // 2 x 3 sets of flat ground
      for (let repeat = 0; repeat < 2; repeat++) {
        for (let set = 1; set <= 3; set++) {
          placeFlatSet(set, 0);
        }
      }
      // 1 slope set
      placeSlope(-38);
      // 5 x 3 sets of flat ground
      for (let repeat = 0; repeat < 5; repeat++) {
        for (let set = 1; set <= 3; set++) {
          placeFlatSet(set, -60);
        }
      }

      // Set up camera to follow player
      this.cameras.main.startFollow(this.player, true);
      this.cameras.main.setFollowOffset(0, 0);
      this.cameras.main.setBounds(
        0,
        0,
        this.worldWidth,
        this.cameras.main.height
      );

      // Create minimap
      try {
        this.createMinimap();
      } catch (error) {
        console.error("Error creating minimap:", error);
      }

      // // Add collision between player and platforms
      // this.physics.add.collider(this.player, this.platforms);

      // Keyboard controls are initialized outside the try block

      // Create player animations
      try {
        this.anims.create({
          key: "walk",
          frames: [
            { key: "walk0" },
            { key: "walk1" },
            { key: "walk2" },
            { key: "walk3" },
            { key: "walk4" },
            { key: "walk3" },
            { key: "walk2" },
            { key: "walk1" },
          ],
          frameRate: 10,
          repeat: -1,
        });

        this.anims.create({
          key: "idle",
          frames: [
            { key: "stand0" },
            { key: "stand1" },
            { key: "stand2" },
            { key: "stand3" },
            { key: "stand2" },
            { key: "stand1" },
            { key: "stand0" },
          ],
          frameRate: 4,
          repeat: -1,
        });

        this.anims.create({
          key: "jump",
          frames: [{ key: "jump0" }, { key: "jump1" }],
          frameRate: 2,
          repeat: -1,
        });

        // Skip prone animation creation - we'll use static sprite directly
        // this.anims.create({
        //   key: "prone",
        //   frames: [{ key: "prone0" }],
        //   frameRate: 1,
        //   repeat: -1,
        // });

        this.anims.create({
          key: "attack",
          frames: [
            { key: "swingP1_0" },
            { key: "swingP1_1" },
            { key: "swingP1_2" },
            { key: "swingP1_3" },
          ],
          frameRate: 8,
          repeat: 0,
        });
        console.log("Animations created");
      } catch (error) {
        console.error("Error creating animations:", error);
      }

      // ---- Keep body bottom glued to sprite bottom on any frame change ----
      const syncFeet = () => {
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setOffset(body.offset.x, this.player.displayHeight - body.height);
      };

      this.player.on(Phaser.Animations.Events.ANIMATION_START, syncFeet);
      this.player.on(Phaser.Animations.Events.ANIMATION_UPDATE, syncFeet);
      this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, syncFeet);

      // optional: when you pause/stop the scene, clean up
      this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.player.off(Phaser.Animations.Events.ANIMATION_START, syncFeet);
        this.player.off(Phaser.Animations.Events.ANIMATION_UPDATE, syncFeet);
        this.player.off(Phaser.Animations.Events.ANIMATION_COMPLETE, syncFeet);
      });

      // Create a container for audio controls at bottom left
      const audioControls = this.add.container(20, MainScene.WORLD_HEIGHT - 60);
      audioControls.setScrollFactor(0);

      // Create background for audio controls
      const audioBg = this.add.rectangle(0, 0, 160, 40, 0x000000, 0.3);
      audioBg.setStrokeStyle(1, 0xffffff, 0.5);
      audioControls.add(audioBg);
      //make it higher layer?
      audioControls.setDepth(100);

      // Add volume control button
      const volumeButton = this.add.text(50, -10, "🔇", {
        color: "#ffffff",
        fontSize: "24px",
      });
      volumeButton.setScrollFactor(0);
      volumeButton.setInteractive();
      volumeButton.on("pointerdown", () => {
        if (this.backgroundMusic instanceof Phaser.Sound.WebAudioSound) {
          const currentVol = this.backgroundMusic.volume;
          let newVol = 0;
          if (currentVol === 0) newVol = 0.25;
          else newVol = 0;

          this.backgroundMusic.setVolume(newVol);
          volumeButton.setText(currentVol === 0 ? `🔊` : `🔇`);
        }
      });
      audioControls.add(volumeButton);

      // Add NPC
      const npcX = 300; // Position NPC 500 pixels from the left
      const npcY = groundY - 60; // Place NPC on the ground
      const npc = this.add.sprite(npcX, npcY, "npc_sketch");
      npc.setScale(1.7); // Adjust scale as needed
      npc.setInteractive(); // Make NPC interactive for touch
      npc.on("pointerdown", () => {
        if (this.interactionText) {
          this.openSketchCanvas();
        }
      });

      const npc2X = 495; // Position NPC 500 pixels from the left
      const npc2Y = groundY - 68; // Place NPC on the ground
      const npc2 = this.add.sprite(npc2X, npc2Y, "npc_sketch2");
      npc2.setScale(0.47); // Adjust scale as needed
      npc2.setInteractive(); // Make NPC interactive for touch
      npc2.on("pointerdown", () => {
        if (this.interactionText2) {
          this.openWebcamCapture();
        }
      });
      const npcVideoX = npcX + 600;
      const npcVideoY = npcY - 54;
      const npcVideo = this.add.sprite(npcVideoX, npcVideoY, "npc_video");
      npcVideo.setScale(0.33); // Adjust scale as needed
      const npcCameraX = npcX + 700;
      const npcCameraY = npcY - 50;
      const npcCamera = this.add.sprite(npcCameraX, npcCameraY, "npc_camera");
      npcCamera.setScale(0.25); // Adjust scale as needed

      // Add interaction zone
      const interactionZone = this.add.zone(npcX, npcY, 100, 100);
      this.physics.add.existing(interactionZone, true);

      const npcARTraceX = npcX + 400;
      const npcARTraceY = npcY - 60;
      const npcARTrace = this.add.sprite(
        npcARTraceX,
        npcARTraceY,
        "npc_camera"
      );
      npcARTrace.setScale(0.3);
      npcARTrace.setInteractive();
      npcARTrace.on("pointerdown", () => {
        if (this.interactionText3) {
          this.openARTraceTool();
        }
      });
      // Add interaction zone for AR Trace NPC
      const interactionZone3 = this.add.zone(
        npcARTraceX,
        npcARTraceY,
        100,
        100
      );
      this.physics.add.existing(interactionZone3, true);

      const interactionZone2 = this.add.zone(npc2X, npc2Y, 100, 100);
      this.physics.add.existing(interactionZone2, true);

      // Add collision between player and AR Trace interaction zone
      this.physics.add.overlap(
        this.player,
        interactionZone,
        () => {
          // Show interaction prompt when player is near
          if (!this.interactionText) {
            this.interactionText = this.add.text(
              npcX,
              npcY - 100,
              this.isMobile ? "Tap NPC to interact" : "Press E to interact",
              {
                color: "#ffffff",
                fontSize: "16px",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
              }
            );
            this.interactionText.setOrigin(0.5);
          }
        },
        undefined,
        this
      );

      this.physics.add.overlap(
        this.player,
        interactionZone2,
        () => {
          if (!this.interactionText2) {
            this.interactionText2 = this.add.text(
              npc2X,
              npc2Y - 100,
              this.isMobile ? "Tap NPC to interact" : "Press E to interact",
              {
                color: "#ffffff",
                fontSize: "16px",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
              }
            );
            this.interactionText2.setOrigin(0.5);
          }
        },
        undefined,
        this
      );

      // Add collision between player and AR Trace interaction zone
      this.physics.add.overlap(
        this.player,
        interactionZone3,
        () => {
          if (!this.interactionText3) {
            this.interactionText3 = this.add.text(
              npcARTraceX,
              npcARTraceY - 100,
              this.isMobile ? "Tap NPC to interact" : "Press E to interact",
              {
                color: "#ffffff",
                fontSize: "16px",
                backgroundColor: "#000000",
                padding: { x: 10, y: 5 },
              }
            );
            this.interactionText3.setOrigin(0.5);
          }
        },
        undefined,
        this
      );

      // Add E key for interaction - use DOM event listener instead of Phaser keyboard
      this.setupEKeyListener();

      // Check if device is mobile
      this.isMobile =
        this.sys.game.device.os.android ||
        this.sys.game.device.os.iOS ||
        this.sys.game.device.os.windowsPhone;

      if (this.isMobile) {
        this.createTouchControls();
      }

      // Expose NPC popup methods globally
      this.exposeNPCPopupMethods();

      // Handle URL parameters for NPC popups
      this.handleNPCPopupParameters();

      console.log("MainScene: create() method completed successfully");
    } catch (error) {
      console.error("Error in create method:", error);
    }

    // Initialize keyboard controls outside try block to ensure they always run
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
      );
      this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
      this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      console.log("Keyboard controls initialized:", {
        cursors: this.cursors,
        spaceKey: this.spaceKey,
        xKey: this.xKey,
        dKey: this.dKey,
      });
    } else {
      console.error("Keyboard input not available!");
    }
  }

  private exposeNPCPopupMethods() {
    if (typeof window !== "undefined") {
      // Extend Window interface for global access
      interface ExtendedWindow extends Window {
        gameScene?: MainScene;
        openNPCPopup?: (npcType: string) => void;
        openSketchCanvas?: () => void;
        openWebcamCapture?: () => void;
        openARTraceTool?: () => void;
        openVideoBooth?: () => void;
      }

      const extendedWindow = window as ExtendedWindow;

      // Expose the scene instance globally for external access
      extendedWindow.gameScene = this;

      // Expose NPC popup methods
      extendedWindow.openNPCPopup = (npcType: string) => {
        this.openNPCPopup(npcType);
      };

      // Expose individual NPC methods
      extendedWindow.openSketchCanvas = () => this.openSketchCanvas();
      extendedWindow.openWebcamCapture = () => this.openWebcamCapture();
      extendedWindow.openARTraceTool = () => this.openARTraceTool();
      extendedWindow.openVideoBooth = () => this.openVideoBooth();

      console.log("NPC popup methods exposed globally");
    }
  }

  private initializeAudio() {
    try {
      // Check if audio is loaded
      if (!this.cache.audio.exists("bgm")) {
        console.error("Audio file not found in cache");
        return;
      }

      // Initialize audio system
      this.sound.setMute(false);

      // Create audio instance
      this.backgroundMusic = this.sound.add("bgm", {
        volume: 0,
        loop: true,
      });

      // Add error handler for audio playback
      this.backgroundMusic.on("playerror", () => {
        console.warn(
          "Error playing background music, attempting to restart..."
        );
        if (this.backgroundMusic) {
          this.backgroundMusic.stop();
          setTimeout(() => {
            try {
              this.backgroundMusic.play();
            } catch (e) {
              console.error("Failed to restart music:", e);
            }
          }, 1000);
        }
      });

      // Start music with user interaction
      const startMusic = () => {
        if (!this.isMusicPlaying && this.backgroundMusic) {
          try {
            this.backgroundMusic.play();
            this.isMusicPlaying = true;
            // Remove the event listeners after first play
            this.input.off("pointerdown", startMusic);
            this.input.keyboard?.off("keydown", startMusic);
          } catch (e) {
            console.error("Failed to start music:", e);
          }
        }
      };

      // Add event listeners for user interaction
      this.input.on("pointerdown", startMusic);
      this.input.keyboard?.on("keydown", startMusic);
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  private createMinimap() {
    console.log("Creating minimap...");

    try {
      // Create minimap container first
      this.createMinimapContainer();

      // Create minimap background - positioned below the title area
      this.minimap = this.add.graphics();
      this.minimap.fillStyle(0x000000, 0.3);
      this.minimap.fillRect(20, 0, this.minimapWidth, this.minimapHeight);

      // Create minimap map layout
      this.minimapMap = this.add.graphics();
      this.minimapMap.setScrollFactor(0);
      console.log("MinimapMap graphics created:", this.minimapMap);

      // Calculate minimap position (relative to content container)
      const minimapX = 20;
      const minimapY = 0;

      // Draw the map layout
      this.drawMinimapMap(minimapX, minimapY);

      // Create player dot
      this.playerDot = this.add.graphics();
      this.playerDot.fillStyle(0xff0000, 1);
      this.playerDot.fillCircle(20, 0, 3);

      // Make minimap stay fixed on screen
      this.minimap.setScrollFactor(0);
      this.playerDot.setScrollFactor(0);

      // Add minimap elements to content container
      this.minimapContent.add([this.minimap, this.minimapMap, this.playerDot]);
      console.log(
        "Minimap elements added to content container. Content list:",
        this.minimapContent.list
      );

      console.log("Minimap created successfully");
      console.log("Minimap elements added to container:", {
        minimap: this.minimap,
        minimapMap: this.minimapMap,
        playerDot: this.playerDot,
      });
    } catch (error) {
      console.error("Error in createMinimap:", error);
    }
  }

  private createMinimapContainer() {
    // Always position minimap at top right of visible screen (unless dragging)
    const containerX =
      this.cameras.main.width - this.minimapContainerWidth - 25;
    const containerY = 100;

    console.log("Creating minimap container at:", containerX, containerY);

    // Create main container
    this.minimapContainer = this.add.container(containerX, containerY);
    this.minimapContainer.setScrollFactor(0);
    this.minimapContainer.setDepth(1000); // Ensure it's on top

    // Create title bar container
    this.minimapTitleBar = this.add.container(0, 0);
    this.minimapTitleBar.setScrollFactor(0);

    // Create content container (for minimap)
    this.minimapContent = this.add.container(0, this.titleBarHeight);
    this.minimapContent.setScrollFactor(0);

    // Create sketchy background for title bar
    const titleBarBg = this.add.graphics();
    this.drawSketchyContainer(
      titleBarBg,
      0,
      0,
      this.minimapContainerWidth,
      this.titleBarHeight
    );

    // Create sketchy background for content area
    this.minimapBackground = this.add.graphics();
    this.drawSketchyContainer(
      this.minimapBackground,
      0,
      0,
      this.minimapContainerWidth,
      this.minimapContainerHeight - this.titleBarHeight
    );

    // Add test rectangle to content area
    const testRect = this.add.graphics();
    testRect.fillRect(
      0,
      0,
      this.minimapContainerWidth,
      this.minimapContainerHeight - this.titleBarHeight
    );

    // Create title
    this.minimapTitle = this.add.text(10, 8, "Mini Map", {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontStyle: "bold",
    });

    // Create location text
    this.minimapLocation = this.add.text(10, 25, "Singapore", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "Arial, Helvetica, sans-serif",
    });

    // Create toggle button
    this.minimapToggleButton = this.add.text(
      this.minimapContainerWidth - 25,
      8,
      "−",
      {
        fontSize: "16px",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontStyle: "bold",
      }
    );
    this.minimapToggleButton.setInteractive();
    this.minimapToggleButton.on("pointerdown", () => {
      this.toggleMinimap();
    });

    // Add elements to title bar
    this.minimapTitleBar.add([
      titleBarBg,
      this.minimapTitle,
      this.minimapLocation,
      this.minimapToggleButton,
    ]);

    // Add elements to content container
    this.minimapContent.add([this.minimapBackground, testRect]);

    // Add title bar and content to main container
    this.minimapContainer.add([this.minimapTitleBar, this.minimapContent]);

    // --- DRAG HANDLE FOR TITLE BAR ---
    // Add a transparent drag handle to the title bar
    const dragHandle = this.add.graphics();
    dragHandle.fillStyle(0xffffff, 0.001); // almost invisible
    dragHandle.fillRect(0, 0, this.minimapContainerWidth, this.titleBarHeight);
    dragHandle.setInteractive(
      new Phaser.Geom.Rectangle(
        0,
        0,
        this.minimapContainerWidth,
        this.titleBarHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );
    // Add drag handle BELOW the toggle button so the button is clickable
    this.minimapTitleBar.addAt(dragHandle, 0);

    // Track drag offset
    this.minimapDragOffsetX = 0;
    this.minimapDragOffsetY = 0;
    dragHandle.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.minimapDragOffsetX = pointer.x - this.minimapContainer.x;
      this.minimapDragOffsetY = pointer.y - this.minimapContainer.y;
      this.isMinimapDragging = true; // Start dragging
    });
    dragHandle.on("pointerup", () => {
      this.isMinimapDragging = false; // Stop dragging
    });
    dragHandle.on("pointerupoutside", () => {
      this.isMinimapDragging = false; // Stop dragging
    });

    // Set the drag handle as draggable and move the container on drag
    this.input.setDraggable(dragHandle);
    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
      ) => {
        if (gameObject === dragHandle) {
          const maxX = MainScene.WORLD_WIDTH - this.minimapContainerWidth;
          const maxY =
            this.cameras.main.height -
            (this.isMinimapOpen
              ? this.minimapContainerHeight
              : this.titleBarHeight);
          const newX = Phaser.Math.Clamp(
            pointer.x - this.minimapDragOffsetX,
            0,
            maxX
          );
          const newY = Phaser.Math.Clamp(
            pointer.y - this.minimapDragOffsetY,
            0,
            maxY
          );
          this.minimapContainer.setPosition(newX, newY);
        }
      }
    );
  }

  private drawSketchyContainer(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // Draw transparent background with sketchy border
    graphics.fillStyle(0xfefcf7, 0.3); // Transparent paper white background
    graphics.fillRoundedRect(x, y, width, height, 8);

    // Draw sketchy border
    graphics.lineStyle(2, 0x4a4a4a, 0.8);
    graphics.strokeRoundedRect(x, y, width, height, 8);

    // Add some sketchy details
    graphics.lineStyle(1, 0x6b6b6b, 0.4);
    graphics.strokeRoundedRect(x + 2, y + 2, width - 4, height - 4, 6);
  }

  private toggleMinimap() {
    this.isMinimapOpen = !this.isMinimapOpen;

    if (this.isMinimapOpen) {
      // Show content container
      this.minimapContent.setVisible(true);
      this.minimapToggleButton.setText("−");
      if (this.minimap) this.minimap.setVisible(true);
      if (this.minimapMap) this.minimapMap.setVisible(true);
      if (this.playerDot) this.playerDot.setVisible(true);
      if (this.minimapLocation) this.minimapLocation.setVisible(true);
    } else {
      // Hide content container (keep title bar visible)
      this.minimapContent.setVisible(false);
      this.minimapToggleButton.setText("+");
      if (this.minimap) this.minimap.setVisible(false);
      if (this.minimapMap) this.minimapMap.setVisible(false);
      if (this.playerDot) this.playerDot.setVisible(false);
      if (this.minimapLocation) this.minimapLocation.setVisible(false);
    }
  }

  private drawMinimapMap(minimapX: number, minimapY: number) {
    // Use actual worldWidth and groundY for accurate minimap representation
    this.mapScaleX = this.minimapWidth / this.worldWidth;
    const groundY = this.cameras.main.height - 50; // Use same as in create()
    this.mapScaleY = this.minimapHeight / groundY;
    const tileWidth = 90;
    const worldWidth = this.worldWidth;

    // Calculate scale factors
    const mapScaleX = this.minimapWidth / worldWidth;
    // For Y, use the vertical range from 0 to groundY (not WORLD_HEIGHT)
    const mapScaleY = this.minimapHeight / groundY;

    // Draw ground level (flat areas)
    this.minimapMap.clear();
    this.minimapMap.fillStyle(0x8b4513, 0.8); // Brown color for ground

    // First flat area (2 sets of 3 tiles)
    const firstFlatWidth = 6 * tileWidth * mapScaleX;
    this.minimapMap.fillRect(
      minimapX + 5,
      minimapY + this.minimapHeight - 5,
      firstFlatWidth,
      5
    );

    // Second flat area (5 sets of 3 tiles) - elevated
    const slopeStartX = 6 * tileWidth + 30; // Same as in create()
    const slopeEndX = slopeStartX + (90 / 1.5) * 1.5; // End of slope
    const secondFlatStartX = slopeEndX;
    const secondFlatWidth = (worldWidth - secondFlatStartX) * mapScaleX;
    const elevatedY = minimapY + this.minimapHeight - 5 - 60 * mapScaleY; // 60 pixels higher

    this.minimapMap.fillRect(
      minimapX + secondFlatStartX * mapScaleX,
      elevatedY,
      secondFlatWidth,
      5
    );

    // Draw slope
    this.minimapMap.fillStyle(0x654321, 0.8); // Darker brown for slope
    this.minimapMap.fillTriangle(
      minimapX + slopeEndX * mapScaleX,
      elevatedY,
      minimapX + slopeStartX * mapScaleX,
      minimapY + this.minimapHeight - 5,
      minimapX + slopeEndX * mapScaleX,
      minimapY + this.minimapHeight - 5
    );

    // Draw NPC positions (use actual scene X/Y, scaled)
    this.minimapMap.fillStyle(0x00ff00, 0.8); // Green for NPCs
    const npcScenePositions = [
      { x: this.worldWidth * 0.2, y: groundY - 68 }, // Example NPC 1
      { x: this.worldWidth * 0.33, y: groundY - 68 }, // Example NPC 2
      { x: this.worldWidth * 0.6, y: groundY - 114 }, // Video NPC
      { x: this.worldWidth * 0.7, y: groundY - 110 }, // Camera NPC
      { x: this.worldWidth * 0.5, y: groundY - 110 }, // AR Trace NPC
    ];
    npcScenePositions.forEach((npc) => {
      this.minimapMap.fillCircle(
        minimapX + npc.x * mapScaleX,
        minimapY + npc.y * mapScaleY,
        2
      );
    });
  }

  private createTouchControls() {
    // Create joystick base
    this.joystickBase = this.add.graphics();
    this.joystickBase.fillStyle(0x000000, 0.5);
    this.joystickBase.fillCircle(0, 0, 50);
    this.joystickBase.setScrollFactor(0);

    // Create joystick thumb
    this.joystickThumb = this.add.graphics();
    this.joystickThumb.fillStyle(0xffffff, 0.8);
    this.joystickThumb.fillCircle(0, 0, 25);
    this.joystickThumb.setScrollFactor(0);

    // Create joystick container
    this.joystick = this.add.container(100, MainScene.WORLD_HEIGHT - 150);
    this.joystick.add([this.joystickBase, this.joystickThumb]);
    this.joystick.setScrollFactor(0);

    // Make joystick interactive
    this.joystick.setInteractive(
      new Phaser.Geom.Circle(0, 0, 50),
      Phaser.Geom.Circle.Contains
    );
    this.joystick.on("pointerdown", this.startJoystick, this);
    this.joystick.on("pointermove", this.moveJoystick, this);
    this.joystick.on("pointerup", this.stopJoystick, this);

    // Add global pointer move and up events to handle joystick movement outside the base
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && this.joystickPointerId === pointer.id) {
        this.moveJoystick(pointer);
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && this.joystickPointerId === pointer.id) {
        this.stopJoystick();
      }
    });

    // Create jump button
    const jumpButtonBg = this.add.graphics();
    jumpButtonBg.fillStyle(0x000000, 0.5);
    jumpButtonBg.fillCircle(0, 0, 40);
    jumpButtonBg.setScrollFactor(0);

    const jumpButtonText = this.add.text(0, 0, "JUMP", {
      fontSize: "16px",
      color: "#ffffff",
    });
    jumpButtonText.setOrigin(0.5);
    jumpButtonText.setScrollFactor(0);

    // --- Jump Button: always at bottom right of visible screen ---
    this.jumpButton = this.add.container(
      this.cameras.main.width - 100,
      this.cameras.main.height - 100
    );
    this.jumpButton.add([jumpButtonBg, jumpButtonText]);
    this.jumpButton.setScrollFactor(0);

    // Make jump button interactive
    this.jumpButton.setInteractive(
      new Phaser.Geom.Circle(0, 0, 40),
      Phaser.Geom.Circle.Contains
    );
    this.jumpButton.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Don't handle jump if touch is in joystick area
      if (this.isTouchInJoystickArea(pointer)) {
        return;
      }

      const currentTime = this.time.now;
      if (currentTime - this.lastJumpTime >= this.jumpCooldownTime) {
        this.jumpButtonPressed = true;
        this.lastJumpTime = currentTime;
        // Prevent joystick from being affected
        pointer.event?.stopPropagation();
      }
    });
    this.jumpButton.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      // Don't handle jump if touch is in joystick area
      if (this.isTouchInJoystickArea(pointer)) {
        return;
      }

      this.jumpButtonPressed = false;
      // Prevent joystick from being affected
      pointer.event?.stopPropagation();
    });
  }

  private startJoystick(pointer: Phaser.Input.Pointer) {
    // Don't start joystick if touch is in jump button area
    if (this.isTouchInJumpArea(pointer)) {
      this.jumpButtonPressed = true;
      return;
    }
    this.joystickActive = true;
    this.joystickPointerId = pointer.id;
    this.lastPointerPosition = { x: pointer.x, y: pointer.y };
    this.moveJoystick(pointer);
  }

  private moveJoystick(pointer: Phaser.Input.Pointer) {
    if (!this.joystickActive || this.isTouchInJumpArea(pointer)) return;

    const distance = Phaser.Math.Distance.Between(
      this.joystick.x,
      this.joystick.y,
      pointer.x,
      pointer.y
    );

    const angle = Phaser.Math.Angle.Between(
      this.joystick.x,
      this.joystick.y,
      pointer.x,
      pointer.y
    );

    const maxDistance = 50;
    const actualDistance = Math.min(distance, maxDistance);

    this.joystickPosition = {
      x: Math.cos(angle) * actualDistance,
      y: Math.sin(angle) * actualDistance,
    };

    this.joystickThumb.setPosition(
      this.joystickPosition.x,
      this.joystickPosition.y
    );
    this.lastPointerPosition = { x: pointer.x, y: pointer.y };

    // Update player movement based on joystick position
    const normalizedX = this.joystickPosition.x / maxDistance;
    const normalizedY = this.joystickPosition.y / maxDistance;

    // Check for prone (joystick down)
    if (normalizedY > 0.7 && !this.isProne && !this.isAttacking) {
      if (!this.isProne) {
        this.isProne = true;

        // Switch visual first (this may change displayHeight)
        if (this.textures.exists("prone0")) {
          this.player.setTexture("prone0");
        }

        // Re-sync offset to this frame, then shrink body keeping feet fixed
        this.resyncOffsetToFrame();
        this.resizeBodyKeepFeet(
          Math.max(24, Math.floor(this.player.body?.height ?? 74 * 0.6))
        );
      }
    } else if (this.isProne && normalizedY <= 0.7) {
      console.log("Joystick up - getting up from prone");
      this.isProne = false;

      // Switch back to idle/standing visual (frame height may change again)
      if (this.anims.exists("idle")) this.player.anims.play("idle", true);
      else this.player.setTexture("stand0");

      // Re-sync offset to the new frame, then restore body height
      this.resyncOffsetToFrame();
      this.resizeBodyKeepFeet(74); // your chosen standing collision height
    }

    // Handle horizontal movement only if not prone or attacking
    if (!this.isProne && !this.isAttacking) {
      if (Math.abs(normalizedX) > 0.1) {
        this.player.setVelocityX(normalizedX * 160);
        this.faceLeft = normalizedX < 0;
        this.player.flipX = !this.faceLeft;
      } else {
        this.player.setVelocityX(0);
      }
    } else {
      this.player.setVelocityX(0);
    }
  }

  private stopJoystick() {
    // Reset joystick position and thumb to center
    this.joystickPosition = { x: 0, y: 0 };
    this.joystickThumb.setPosition(0, 0);
    this.joystickActive = false;
    this.joystickPointerId = null; // Reset the pointer ID
    // Reset velocity and animation when joystick is released
    this.player.setVelocityX(0);
    if (this.player.body?.blocked.down) {
      this.player.anims.play("idle", true);
    }
  }

  private isTouchInJumpArea(pointer: Phaser.Input.Pointer): boolean {
    // Check if the touch is inside the jump button area
    const jumpButtonBounds = this.jumpButton.getBounds(); // Get the bounds of the jump button
    return Phaser.Geom.Rectangle.Contains(
      jumpButtonBounds,
      pointer.x,
      pointer.y
    );
  }

  private isTouchInJoystickArea(pointer: Phaser.Input.Pointer): boolean {
    // Check if the touch is inside the joystick area
    const joystickBounds = this.joystick.getBounds();
    return Phaser.Geom.Rectangle.Contains(joystickBounds, pointer.x, pointer.y);
  }

  private handleJumpButtonTouch(pointer: Phaser.Input.Pointer) {
    // When the jump button is pressed, ensure joystick does not interfere
    if (this.isTouchInJumpArea(pointer)) {
      this.jumpButtonPressed = true;
      this.lastJumpTime = this.time.now;
      // Prevent joystick from reacting while jump button is being pressed
      this.joystickActive = false;
    }
  }

  update(time: number, delta: number) {
    if (!this.cursors || !this.spaceKey || !this.xKey) {
      console.warn("Controls not initialized:", {
        cursors: this.cursors,
        spaceKey: this.spaceKey,
        xKey: this.xKey,
        keyboard: this.input.keyboard,
      });
      return;
    }

    // Debug player body
    if (!this.player.body) {
      console.error("Player body is null!");
      return;
    }

    // Update parallax backgrounds (no jump, always at % of world width)
    if (
      this.backgroundLayers &&
      this.backgroundParallax &&
      this.backgroundBaseX
    ) {
      this.backgroundLayers.forEach((layer, i) => {
        layer.x =
          this.backgroundBaseX[i] -
          this.cameras.main.scrollX * this.backgroundParallax[i];
      });
    }
    // Keep jump button at correct screen position
    if (this.jumpButton) {
      this.jumpButton.x = this.cameras.main.width - 100;
      this.jumpButton.y = this.cameras.main.height - 100;
    }
    // (Removed minimapContainer auto-reset so it stays where user drags it)

    // Update player dot position on minimap (relative to content container)
    if (this.isMinimapOpen && this.playerDot) {
      const px = 20 + this.player.x * this.mapScaleX; // 20 = your minimapX
      const py = this.player.y * this.mapScaleY;
      this.playerDot.setPosition(px, py);
    }

    // Draw debug boxes
    // this.drawDebugBoxes();

    // const isOnGround = this.player.body?.touching.down;
    const isOnGround = this.player.body?.blocked.down;
    const currentAnim = this.player.anims.currentAnim?.key;

    // === Debug Toggle ===
    if (Phaser.Input.Keyboard.JustDown(this.dKey)) {
      this.showDebugBoxes = !this.showDebugBoxes;
      console.log("Debug boxes:", this.showDebugBoxes ? "ON" : "OFF");
    }

    // === Attack Handling ===
    if (this.xKey.isDown && !this.isAttacking && !this.isProne) {
      // console.log("Attack key pressed");
      this.isAttacking = true;
      this.player.anims.play("attack", true);
      // Reset attack state after animation completes
      this.time.delayedCall(500, () => {
        this.isAttacking = false;
      });
      // Prevent browser default behavior for X key
      // Note: This is handled by Phaser's keyboard system automatically
    }

    // === Prone Handling ===
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (this.cursors.down.isDown && isOnGround && !this.isAttacking) {
      if (!this.isProne) {
        this.isProne = true;

        // Switch visual first (this may change displayHeight)
        if (this.textures.exists("prone0")) {
          this.player.setTexture("prone0");
        }

        // Re-sync offset to this frame, then shrink body keeping feet fixed
        this.resyncOffsetToFrame();
        this.resizeBodyKeepFeet(Math.max(24, Math.floor(body.height * 0.6)));
      }
    } else if (this.isProne && !this.cursors.down.isDown) {
      this.isProne = false;

      // Switch back to idle/standing visual (frame height may change again)
      if (this.anims.exists("idle")) this.player.anims.play("idle", true);
      else this.player.setTexture("stand0");

      // Re-sync offset to the new frame, then restore body height
      this.resyncOffsetToFrame();
      this.resizeBodyKeepFeet(74); // your chosen standing collision height
    }

    // === Jump Handling ===
    // When Jump is pressed and player is on ground, jump
    if (
      (this.spaceKey.isDown || this.jumpButtonPressed) &&
      isOnGround &&
      !this.isJumping
    ) {
      this.player.setVelocityY(-300);
      this.isJumping = true;
      this.hasDoubleJumped = false; // Reset double jump when landing
      this.jumpButtonPressed = false; // Reset button state after jump

      return;
    }

    // When player is in the air, play jump animation
    if (!isOnGround && this.isJumping) {
      // Handle double jump
      if (
        (Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
          this.jumpButtonPressed) &&
        !this.hasDoubleJumped &&
        currentAnim === "jump"
      ) {
        this.player.setVelocityY(-200);
        this.player.setVelocityX(this.faceLeft ? -250 : 250);
        this.hasDoubleJumped = true;
        this.jumpButtonPressed = false; // Reset button state after double jump
      }
      this.player.anims.play("jump", true);
      return;
    }

    // When player is on ground and jump animation is playing, reset jumping flag
    if (isOnGround && this.isJumping && currentAnim === "jump") {
      this.isJumping = false;
      // Only reset velocity if joystick is not active
      if (!this.joystickActive) {
        this.player.setVelocityX(0);
      }
    }

    // Prevent constant jump spamming
    this.jumpCooldown -= delta;
    let isMoving = false;

    // Only process keyboard input if not on mobile and not prone/attacking
    if (!this.isMobile && !this.isProne && !this.isAttacking) {
      // === Movement ===
      if (this.cursors.left.isDown) {
        // console.log("Left key pressed, applying force");
        this.faceLeft = true;
        this.player.setVelocityX(-160);
        this.player.flipX = false;
        isMoving = true;
        // Also try applying force as backup
        if (this.player.body && "setVelocityX" in this.player.body) {
          this.player.body.setVelocityX(-160);
        }
        // Fallback: direct position update if physics isn't working
        if (Math.abs(this.player.body.velocity.x) < 1) {
          this.player.x -= 2;
        }
      } else if (this.cursors.right.isDown) {
        this.faceLeft = false;
        this.player.setVelocityX(160);
        this.player.flipX = true;
        isMoving = true;
        // Also try applying force as backup
        if (this.player.body && "setVelocityX" in this.player.body) {
          this.player.body.setVelocityX(160);
        }
        // Fallback: direct position update if physics isn't working
        if (Math.abs(this.player.body.velocity.x) < 1) {
          this.player.x += 2;
        }
      } else {
        this.player.setVelocityX(0);
        if (this.player.body && "setVelocityX" in this.player.body) {
          this.player.body.setVelocityX(0);
        }
      }
    } else if (this.isProne || this.isAttacking) {
      // Stop movement when prone or attacking
      this.player.setVelocityX(0);
    } else {
      // Handle mobile input
      if (this.joystickActive) {
        // Create a pointer object with the last known position
        const pointer = {
          x: this.lastPointerPosition.x,
          y: this.lastPointerPosition.y,
        } as Phaser.Input.Pointer;
        isMoving = true;
        this.moveJoystick(pointer);
      } else {
        // Reset velocity when joystick is not active
        this.player.setVelocityX(0);
      }
    }

    //remove jumpCooldown
    if (isOnGround) {
      this.jumpCooldown = 0;
    }

    // === Animation Handling ===
    // Don't change animation if attacking or prone (let those animations play)
    if (!this.isAttacking && !this.isProne) {
      // Jumping animation: play only when NOT on ground
      if (isMoving && isOnGround) {
        if (currentAnim !== "walk") this.player.anims.play("walk", true);
      } else if (isOnGround) {
        if (currentAnim !== "idle") this.player.anims.play("idle", true);
      }
    }

    // Handle NPC interaction using our custom E key handler
    if (this.eKeyPressed && this.interactionText) {
      this.openSketchCanvas();
    }
    if (this.eKeyPressed && this.interactionText2) {
      this.openWebcamCapture();
    }
    if (this.eKeyPressed && this.interactionText3) {
      this.openARTraceTool();
    }

    // Remove interaction text when player moves away
    if (this.interactionText && this.player) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.interactionText.x,
        this.interactionText.y
      );
      if (distance > 150) {
        this.interactionText.destroy();
        this.interactionText = undefined;
      }
    }
    if (this.interactionText2 && this.player) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.interactionText2.x,
        this.interactionText2.y
      );
      if (distance > 150) {
        this.interactionText2.destroy();
        this.interactionText2 = undefined;
      }
    }
    if (this.interactionText3 && this.player) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.interactionText3.x,
        this.interactionText3.y
      );
      if (distance > 150) {
        this.interactionText3.destroy();
        this.interactionText3 = undefined;
      }
    }
  }

  // Add method to adjust volume
  setMusicVolume(volume: number) {
    if (this.backgroundMusic instanceof Phaser.Sound.WebAudioSound) {
      this.backgroundMusic.setVolume(volume);
    }
  }

  // Add method to handle sketch interaction
  private openSketchCanvas() {
    // Dispatch a custom event to open the sketch canvas
    const event = new CustomEvent("openSketchCanvas");
    window.dispatchEvent(event);
  }

  private openWebcamCapture() {
    // Pause the game
    this.scene.pause();
    // Dispatch a custom event to open the webcam capture
    const event = new CustomEvent("openWebcamCapture");
    window.dispatchEvent(event);

    // Add event listener for webcam close
    const resumeHandler = () => {
      this.scene.resume();
      window.removeEventListener("webcamClosed", resumeHandler);
    };
    window.addEventListener("webcamClosed", resumeHandler);
  }

  private openARTraceTool() {
    // Pause the game
    this.scene.pause();
    // Dispatch a custom event to open the AR trace tool
    const event = new CustomEvent("openARTraceTool");
    window.dispatchEvent(event);

    // Add event listener for AR trace tool close
    const resumeHandler = () => {
      this.scene.resume();
      window.removeEventListener("arTraceToolClosed", resumeHandler);
    };
    window.addEventListener("arTraceToolClosed", resumeHandler);
  }

  private openVideoBooth() {
    // Pause the game
    this.scene.pause();
    // Dispatch a custom event to open the video booth
    const event = new CustomEvent("openVideoBooth");
    window.dispatchEvent(event);

    // Add event listener for video booth close
    const resumeHandler = () => {
      this.scene.resume();
      window.removeEventListener("videoBoothClosed", resumeHandler);
    };
    window.addEventListener("videoBoothClosed", resumeHandler);
  }

  private setupEKeyListener() {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle E key if not typing in input fields
      const activeElement = document.activeElement as HTMLElement;
      const isTypingInInput =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.contentEditable === "true" ||
          activeElement.isContentEditable);

      if (event.key === "e" || event.key === "E") {
        if (!isTypingInInput) {
          this.eKeyPressed = true;
          event.preventDefault();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "e" || event.key === "E") {
        this.eKeyPressed = false;
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Store references for cleanup
    this.eKeyDownHandler = handleKeyDown;
    this.eKeyUpHandler = handleKeyUp;
  }

  private eKeyDownHandler?: (event: KeyboardEvent) => void;
  private eKeyUpHandler?: (event: KeyboardEvent) => void;

  private drawDebugBoxes() {
    if (!this.showDebugBoxes || !this.debugGraphics) return;

    // Clear previous debug graphics
    this.debugGraphics.clear();

    // Draw player bounding box
    if (this.player && this.player.body) {
      const bounds = this.player.body;
      this.debugGraphics.lineStyle(2, 0x00ff00, 1); // Green outline

      // Get the actual physics body position and size
      const bodyX = bounds.x;
      const bodyY = bounds.y;
      const bodyWidth = bounds.width;
      const bodyHeight = bounds.height;

      // Draw the physics body rectangle at its actual position
      // Physics body position is the top-left corner
      const cam = this.cameras.main;
      this.debugGraphics.strokeRect(
        bodyX - cam.scrollX,
        bodyY - cam.scrollY,
        bodyWidth,
        bodyHeight
      );

      // Draw center point
      this.debugGraphics.fillStyle(0x00ff00, 1);
      this.debugGraphics.fillCircle(bodyX, bodyY, 3);

      // Draw player sprite bounds for comparison
      this.debugGraphics.lineStyle(1, 0xffff00, 0.5); // Yellow outline for sprite
      this.debugGraphics.strokeRect(
        this.player.x - this.player.width * this.player.originX - cam.scrollX,
        this.player.y - this.player.height * this.player.originY - cam.scrollY,
        this.player.width,
        this.player.height
      );

      // Add debug text to show dimensions
      if (
        Math.floor(this.time.now / 1000) !==
        Math.floor((this.time.now - 16) / 1000)
      ) {
        console.log("Debug Info:", {
          sprite: {
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height,
            originX: this.player.originX,
            originY: this.player.originY,
          },
          physics: {
            x: bodyX,
            y: bodyY,
            width: bodyWidth,
            height: bodyHeight,
            offsetX: bounds.offset.x,
            offsetY: bounds.offset.y,
          },
        });
      }
    }

    // Draw ground bounding box
    const groundY = this.cameras.main.height - 50;
    const groundWidth = this.worldWidth;
    const groundHeight = 100;

    this.debugGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    this.debugGraphics.strokeRect(0, groundY, groundWidth, groundHeight);
  }

  shutdown() {
    // Clean up event listeners
    if (this.eKeyDownHandler) {
      window.removeEventListener("keydown", this.eKeyDownHandler);
    }
    if (this.eKeyUpHandler) {
      window.removeEventListener("keyup", this.eKeyUpHandler);
    }
  }
}
