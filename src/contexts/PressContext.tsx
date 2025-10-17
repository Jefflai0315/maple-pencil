"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// Extend Window interface for our global controller
declare global {
  interface Window {
    circularGalleryScrollController?: {
      setPressed: (pressed: boolean) => void;
    };
  }
}

interface PressContextType {
  isPressed: boolean;
  setIsPressed: (pressed: boolean) => void;
  handlePressStart: () => void;
  handlePressEnd: () => void;
  faceImage: string;
}

const PressContext = createContext<PressContextType | undefined>(undefined);

export const usePress = () => {
  const context = useContext(PressContext);
  if (context === undefined) {
    throw new Error("usePress must be used within a PressProvider");
  }
  return context;
};

interface PressProviderProps {
  children: ReactNode;
}

export const PressProvider = ({ children }: PressProviderProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [faceImage, setFaceImage] = useState("/sketch/face_white.svg");

  const handlePressStart = useCallback(() => {
    setIsPressed(true);
    setFaceImage("/sketch/face_white_fast.png"); // Using existing face.png instead
    // Notify CircularGallery without causing re-render
    if (
      typeof window !== "undefined" &&
      window.circularGalleryScrollController
    ) {
      window.circularGalleryScrollController.setPressed(true);
    }
  }, []);

  const handlePressEnd = useCallback(() => {
    setIsPressed(false);
    setFaceImage("/sketch/face_white.svg");
    // Notify CircularGallery without causing re-render
    if (
      typeof window !== "undefined" &&
      window.circularGalleryScrollController
    ) {
      window.circularGalleryScrollController.setPressed(false);
    }
  }, []);

  const value = {
    isPressed,
    setIsPressed,
    handlePressStart,
    handlePressEnd,
    faceImage,
  };

  return (
    <PressContext.Provider value={value}>{children}</PressContext.Provider>
  );
};
