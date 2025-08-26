import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

export interface MuralItem {
  id: string;
  imageUrl: string;
  videoUrl: string;
  cloudinaryVideoUrl?: string; // Store Cloudinary video URL if available
  fallbackVideoUrl?: string; // Store fallback video URL if Cloudinary fails
  gridPosition: number;
  timestamp: string;
  userDetails: {
    name: string;
    description: string;
  };
}

class Database {
  private dataPath: string;
  private items: MuralItem[] = [];
  private nextGridPosition = 0;

  constructor() {
    this.dataPath = join(process.cwd(), "data", "mural-items.json");
    this.loadData();
  }

  private async loadData() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = join(process.cwd(), "data");
      await mkdir(dataDir, { recursive: true });

      // Try to read existing data
      const data = await readFile(this.dataPath, "utf-8");
      const parsed = JSON.parse(data);
      this.items = parsed.items || [];
      this.nextGridPosition = parsed.nextGridPosition || 0;
    } catch {
      // If file doesn't exist or is invalid, start with empty data
      this.items = [];
      this.nextGridPosition = 0;
    }
  }

  private async saveData() {
    try {
      const data = {
        items: this.items,
        nextGridPosition: this.nextGridPosition,
      };
      await writeFile(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  }

  async addItem(
    item: Omit<MuralItem, "id" | "gridPosition">
  ): Promise<MuralItem> {
    const newItem: MuralItem = {
      ...item,
      id: Date.now().toString(),
      gridPosition: this.nextGridPosition,
    };

    this.items.push(newItem);
    this.nextGridPosition = (this.nextGridPosition + 1) % 120; // 10x12 grid = 120 positions

    await this.saveData();
    return newItem;
  }

  async getAllItems(): Promise<MuralItem[]> {
    return this.items;
  }

  async getItemById(id: string): Promise<MuralItem | null> {
    return this.items.find((item) => item.id === id) || null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      await this.saveData();
      return true;
    }
    return false;
  }

  async clearAll(): Promise<void> {
    this.items = [];
    this.nextGridPosition = 0;
    await this.saveData();
  }
}

// Export singleton instance
export const db = new Database();
