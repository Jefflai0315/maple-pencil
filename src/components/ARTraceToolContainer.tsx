import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
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
    //dispatch event to close the AR Trace Tool
    window.dispatchEvent(new Event("arTraceToolClosed"));
    setIsOpen(false);
  };

  return (
    <Box sx={{ position: "fixed", zIndex: 10000 }}>
      {isOpen && <ARTraceTool onClose={handleClose} />}
    </Box>
  );
};

export default ARTraceToolContainer;
