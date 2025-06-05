import sharp from "sharp";
import path from "path";

async function convertSprite() {
  const assets = [
    {
      input: path.join(process.cwd(), "public", "sprites", "player.svg"),
      output: path.join(process.cwd(), "public", "sprites", "player.png"),
    },
    {
      input: path.join(process.cwd(), "public", "tiles", "grass.svg"),
      output: path.join(process.cwd(), "public", "tiles", "grass.png"),
    },
  ];

  for (const asset of assets) {
    try {
      await sharp(asset.input).png().toFile(asset.output);
      console.log(`Converted ${path.basename(asset.input)} successfully!`);
    } catch (error) {
      console.error(`Error converting ${path.basename(asset.input)}:`, error);
    }
  }
}

convertSprite();
