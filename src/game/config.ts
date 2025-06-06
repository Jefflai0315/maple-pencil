import * as Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: typeof window !== "undefined" ? window.innerWidth : 800,
  height: typeof window !== "undefined" ? window.innerHeight : 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 500 },
      debug: false,
    },
  },
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: "game-container",
    width: "100%",
    height: "100%",
    min: {
      width: 320,
      height: 480,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true,
    },
  },
};
