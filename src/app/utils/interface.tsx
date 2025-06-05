// Type for Art & Event service
export interface ServiceExample {
  type: "image" | "video";
  src: string;
  caption: string;
}

export interface Category {
  name: string;
  description: string;
  examples: ServiceExample[];
  dynamic?: boolean;
}

export interface ArtEventService {
  name: string;
  description: string;
  examples?: Category[];
  dynamic?: boolean;
}

export interface ArtEventContent {
  title: string;
  services: ArtEventService[];
  npc: string;
  level: string;
  buttons: string[];
}
