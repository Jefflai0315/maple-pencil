// NPC popup navigation utility for the game world
export interface NPCPopupNavigation {
  openNPCPopup: (npcType: string) => void;
  openNPCPopupFromExternal: (npcType: string) => void;
}

// Available NPC popup types
export const NPC_POPUP_TYPES = {
  SKETCH: "sketch",
  WEBCAM: "webcam",
  AR_TRACE: "artrace",
} as const;

export type NPCPopupType =
  (typeof NPC_POPUP_TYPES)[keyof typeof NPC_POPUP_TYPES];

// Extend Window interface for NPC navigation
interface ExtendedWindow extends Window {
  gameScene?: NPCPopupNavigation;
  openNPCPopup?: (npcType: string) => void;
}

// Function to open NPC popup from external sources
export const openNPCPopup = (npcType: NPCPopupType): void => {
  if (typeof window !== "undefined") {
    const extendedWindow = window as ExtendedWindow;

    // Try to use the global NPC popup function
    if (extendedWindow.openNPCPopup) {
      extendedWindow.openNPCPopup(npcType);
      return;
    }

    // Fallback: update URL parameters and reload
    const url = new URL(window.location.href);
    url.searchParams.set("npc", npcType);
    window.history.pushState({}, "", url.toString());

    // Reload the page to trigger NPC popup
    window.location.reload();
  }
};

// Function to get current NPC popup from URL
export const getCurrentNPCPopupFromURL = (): NPCPopupType | null => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const npcPopup = urlParams.get("npc") as NPCPopupType;
    return npcPopup && Object.values(NPC_POPUP_TYPES).includes(npcPopup)
      ? npcPopup
      : null;
  }
  return null;
};

// Function to navigate to game world with NPC popup
export const navigateToGameWorldWithNPCPopup = (
  npcType: NPCPopupType
): void => {
  if (typeof window !== "undefined") {
    const url = new URL("/world", window.location.origin);
    url.searchParams.set("npc", npcType);
    window.location.href = url.toString();
  }
};

// Function to check if we're in the game world
export const isInGameWorld = (): boolean => {
  if (typeof window !== "undefined") {
    return window.location.pathname === "/world";
  }
  return false;
};
