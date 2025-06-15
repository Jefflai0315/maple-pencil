import React from "react";
import { Box } from "@mui/material";
import Game from "./game/Game";

function App() {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Game />
    </Box>
  );
}

export default App;
