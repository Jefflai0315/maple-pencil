import * as Phaser from "phaser";

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private isJumping: boolean = false;
  private hasDoubleJumped: boolean = false;
  private faceLeft: boolean = false;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private jumpCooldown = 0;
  private worldWidth = 1500; // Increased world width
  private minimap!: Phaser.GameObjects.Graphics;
  private playerDot!: Phaser.GameObjects.Graphics;
  private minimapMap!: Phaser.GameObjects.Graphics; // Graphics for the map layout
  private minimapWidth = 180;
  private minimapHeight = 100;
  private minimapScale = 0.12; // Scale factor for the minimap
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
  private eKey!: Phaser.Input.Keyboard.Key;
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

    // Load game assets
    // Load tiles
    for (let i = 1; i <= 3; i++) {
      this.load.image(`DRT_top${i}`, `/tiles/DRT_top${i}.png`);
      this.load.image(`DRT_middle${i}`, `/tiles/DRT_middle${i}.png`);
      this.load.image(`DRT_bottom${i}`, `/tiles/DRT_bottom${i}.png`);
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

      // Create background layers with parallax effect
      const layer1 = this.add.sprite(0, 0, "bg_layer1");
      const layer2 = this.add.sprite(0, 0, "bg_layer2");
      const layer3 = this.add.sprite(0, 0, "bg_layer3");
      const layer4 = this.add.sprite(0, 0, "bg_layer4");
      const layerOrigin = [
        [0, -1.7], // CBD
        [-1, -1.5], // HDB
        [-6.5, -4.3], //merlion
        [0, -1.5], // CBD buidling
      ];

      // Set the origin of all layers to top-left
      [layer1, layer2, layer3, layer4].forEach((layer, index) => {
        layer.setOrigin(layerOrigin[index][0], layerOrigin[index][1]);
        layer.setScrollFactor(0);
        // Set display size to match game height while maintaining aspect ratio
        // layer.setDisplaySize(
        //   layer.width * (this.cameras.main.height / layer.height),
        //   this.cameras.main.height
        // );
      });

      // Store layers for update
      this.backgroundLayers = [layer1, layer2, layer3, layer4];

      // Set world bounds
      this.physics.world.setBounds(
        0,
        0,
        this.worldWidth,
        this.cameras.main.height
      );

      // Add a background color to make sure the scene is visible
      this.cameras.main.setBackgroundColor("#87CEEB"); // Sky blue background

      // Calculate player spawn position
      const groundY = this.cameras.main.height - 50; // Changed from -140 to -80 to make ground lower
      const spawnX = 100; // Start from left side
      const spawnY = groundY - 70;

      // Create player
      try {
        this.player = this.physics.add.sprite(spawnX, spawnY, "stand0");
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(300);
        this.player.flipX = true; // Set player to face right by default
        this.faceLeft = false; // Set faceLeft to false by default
      } catch (error) {
        console.error("Error creating player:", error);
      }

      // --- Create invisible physics ground for collision ---
      const groundHeight = 100; // 40(top) + 60(middle) + 40(bottom) or 100+40 for slope
      const groundWidth = 20 * 90; // 2x3 flat + 1 slope + 2x3 flat = 13 tiles wide
      const ground = this.add.rectangle(
        groundWidth / 2,
        groundY + groundHeight / 2,
        groundWidth,
        groundHeight - 10,
        0x000000
        // invisible
      );
      this.physics.add.existing(ground, true); // static body
      this.physics.add.collider(this.player, ground);

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
      const tileWidth = 90;
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
          groundY + 110 + yOffset,
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
        console.log("Animations created");
      } catch (error) {
        console.error("Error creating animations:", error);
      }

      // // Add debug text
      // this.add.text(10, 70, "Use arrow keys to move\nSpace to jump", {
      //   color: "#000000",
      //   fontSize: "16px",
      // });

      // Create a container for audio controls at bottom left
      const audioControls = this.add.container(
        20,
        this.cameras.main.height - 60
      );
      audioControls.setScrollFactor(0);

      // Create background for audio controls
      const audioBg = this.add.rectangle(0, 0, 160, 40, 0x000000, 0.3);
      audioBg.setStrokeStyle(1, 0xffffff, 0.5);
      audioControls.add(audioBg);

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

      // Add E key for interaction
      if (this.input.keyboard) {
        this.eKey = this.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.E
        );
      }

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
      console.log("Keyboard controls initialized:", {
        cursors: this.cursors,
        spaceKey: this.spaceKey,
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
      this.minimap.fillRect(0, 0, this.minimapWidth, this.minimapHeight);

      // Create minimap map layout
      this.minimapMap = this.add.graphics();
      this.minimapMap.setScrollFactor(0);
      console.log("MinimapMap graphics created:", this.minimapMap);

      // Calculate minimap position (relative to content container)
      const minimapX = 0;
      const minimapY = 0;

      // Draw the map layout
      this.drawMinimapMap(minimapX, minimapY);

      // Create player dot
      this.playerDot = this.add.graphics();
      this.playerDot.fillStyle(0xff0000, 1);
      this.playerDot.fillCircle(0, 0, 3);

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
          const maxX = this.cameras.main.width - this.minimapContainerWidth;
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
    const groundY = this.cameras.main.height - 50; // Same as in create()
    const tileWidth = 90;
    const worldWidth = this.worldWidth;

    // Calculate scale factors
    const mapScaleX = this.minimapWidth / worldWidth;
    const mapScaleY = this.minimapHeight / (this.cameras.main.height * 0.8);

    // Draw ground level (flat areas)
    this.minimapMap.fillStyle(0x8b4513, 0.8); // Brown color for ground

    // First flat area (2 sets of 3 tiles)
    const firstFlatWidth = 6 * tileWidth * mapScaleX;
    this.minimapMap.fillRect(
      minimapX,
      minimapY + this.minimapHeight - 20,
      firstFlatWidth,
      20
    );

    // Second flat area (5 sets of 3 tiles) - elevated
    const slopeStartX = 6 * tileWidth + 30; // Same as in create()
    const slopeEndX = slopeStartX + (90 / 1.5) * 1.5; // End of slope
    const secondFlatStartX = slopeEndX;
    const secondFlatWidth = (worldWidth - secondFlatStartX) * mapScaleX;
    const elevatedY = minimapY + this.minimapHeight - 20 - 60 * mapScaleY; // 60 pixels higher

    this.minimapMap.fillRect(
      minimapX + secondFlatStartX * mapScaleX,
      elevatedY,
      secondFlatWidth,
      20
    );

    // Draw slope
    this.minimapMap.fillStyle(0x654321, 0.8); // Darker brown for slope

    // Create a simple slope representation (triangle)
    this.minimapMap.fillTriangle(
      minimapX + slopeStartX * mapScaleX,
      minimapY + this.minimapHeight - 20, // Bottom left
      minimapX + slopeEndX * mapScaleX,
      elevatedY, // Top right
      minimapX + slopeStartX * mapScaleX,
      elevatedY // Top left
    );

    // Draw NPC positions
    this.minimapMap.fillStyle(0x00ff00, 0.8); // Green for NPCs

    // NPC positions (approximate)
    const npcPositions = [
      { x: 300, y: groundY - 300 }, // First NPC
      { x: 500, y: groundY - 300 }, // Second NPC
      { x: 900, y: groundY - 360 }, // Video NPC (elevated)
      { x: 1000, y: groundY - 360 }, // Camera NPC (elevated)
      { x: 700, y: groundY - 360 }, // AR Trace NPC
    ];

    npcPositions.forEach((npc) => {
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
    this.joystick = this.add.container(100, this.cameras.main.height - 150);
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
        this.input.stopPropagation();
      }
    });
    this.jumpButton.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      // Don't handle jump if touch is in joystick area
      if (this.isTouchInJoystickArea(pointer)) {
        return;
      }

      this.jumpButtonPressed = false;
      // Prevent joystick from being affected
      this.input.stopPropagation();
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
    if (Math.abs(normalizedX) > 0.1) {
      this.player.setVelocityX(normalizedX * 160);
      this.faceLeft = normalizedX < 0;
      this.player.flipX = !this.faceLeft;
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
    if (this.player.body?.touching.down) {
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
    if (!this.cursors || !this.spaceKey) {
      console.warn("Controls not initialized:", {
        cursors: this.cursors,
        spaceKey: this.spaceKey,
      });
      return;
    }

    // Update parallax scrolling
    if (this.player && this.player.body) {
      // Calculate new positions based on player movement
      const playerDeltaX =
        this.player.x -
        (this.player.x - (this.player.body.velocity.x * delta) / 1000);

      // Update each layer's position with different speeds
      if (playerDeltaX !== 0) {
        // TODO: clamp, user at the boundary, the background should not move
        this.backgroundLayers.forEach((layer, index) => {
          const speed = 0.1 * (index * 0.1 + 1); // 0.1, 0.2, 0.3, 0.4
          this.layerPositions[index] -= playerDeltaX * speed;

          // // Keep layers within bounds
          // const maxOffset = layer.width * layer.scaleX - this.cameras.main.width;
          // this.layerPositions[index] = Phaser.Math.Clamp(
          //   this.layerPositions[index],
          //   -maxOffset,
          //   0
          // );

          layer.x = this.layerPositions[index];
        });
      }
    }

    // Update player dot position on minimap (relative to content container)
    if (this.isMinimapOpen && this.playerDot) {
      const minimapX = this.player.x * this.minimapScale;
      const minimapY = this.player.y * this.minimapScale;
      this.playerDot.setPosition(minimapX, minimapY);
    }

    const isOnGround = this.player.body?.touching.down;
    const currentAnim = this.player.anims.currentAnim?.key;

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

    // Only process keyboard input if not on mobile
    if (!this.isMobile) {
      // === Movement ===
      if (this.cursors.left.isDown) {
        this.faceLeft = true;
        this.player.setVelocityX(-160);
        this.player.flipX = false;
        isMoving = true;
      } else if (this.cursors.right.isDown) {
        this.faceLeft = false;
        this.player.setVelocityX(160);
        this.player.flipX = true;
        isMoving = true;
      } else {
        this.player.setVelocityX(0);
      }
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
    // Jumping animation: play only when NOT on ground
    if (isMoving && isOnGround) {
      if (currentAnim !== "walk") this.player.anims.play("walk", true);
    } else {
      if (currentAnim !== "idle") this.player.anims.play("idle", true);
    }

    // Handle NPC interaction
    if (this.eKey.isDown && this.interactionText) {
      this.openSketchCanvas();
    }
    if (this.eKey.isDown && this.interactionText2) {
      this.openWebcamCapture();
    }
    if (this.eKey.isDown && this.interactionText3) {
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
}
