import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import ARTraceTool from "./ARTraceTool";

const ARTraceToolContainer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Log when component mounts
  useEffect(() => {
    console.log("ARTraceToolContainer mounted");
  }, []);

  useEffect(() => {
    console.log("Setting up event listener for openARTraceTool");

    const handleOpenARTraceTool = () => {
      console.log("Event received: openARTraceTool");
      console.log("Current isOpen state:", isOpen);
      setIsOpen(true);
      console.log("Set isOpen to true");
    };

    window.addEventListener("openARTraceTool", handleOpenARTraceTool);

    return () => {
      console.log("Cleaning up event listener");
      window.removeEventListener("openARTraceTool", handleOpenARTraceTool);
    };
  }, [isOpen]); // Added isOpen to dependencies to track state changes

  const handleClose = () => {
    console.log("Closing AR Trace Tool");
    setIsOpen(false);
  };

  // Test function to manually trigger the tool
  const handleTestClick = () => {
    console.log("Test button clicked");
    setIsOpen(true);
  };

  console.log("Rendering ARTraceToolContainer, isOpen:", isOpen);

  return (
    <Box sx={{ position: "fixed", top: 10, right: 10, zIndex: 1000 }}>
      <Button
        variant="contained"
        onClick={handleTestClick}
        sx={{ backgroundColor: "#1976d2" }}
      >
        Test AR Tool
      </Button>
      {isOpen && <ARTraceTool onClose={handleClose} />}
    </Box>
  );
};

export default ARTraceToolContainer;
