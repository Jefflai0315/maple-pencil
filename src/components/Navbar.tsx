import { useState } from "react";
import QuestPopup from "./QuestPopup";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState("About");

  const handleClick = (item: string) => {
    if (item === selectedSection) {
      // If clicking the same tab, toggle the popup
      setIsOpen(!isOpen);
    } else {
      // If clicking a different tab, switch to it and keep popup open
      setSelectedSection(item);
      setIsOpen(true);
    }
  };

  return (
    <>
      <nav
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          width: "100%",
          height: "48px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          zIndex: 10000,
          fontSize: "14px",
          userSelect: "none",
        }}
        className="navbar-tab"
      >
        {["About", "Shop", "Art & Event"].map((item) => (
          <button
            key={item}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor =
                "#FFD700";
              (e.currentTarget as HTMLElement).style.color = "#222";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#222";
              (e.currentTarget as HTMLElement).style.color = "#FFD700";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "2px 2px 0 #000";
            }}
            onClick={() => handleClick(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      {isOpen && (
        <QuestPopup
          onClose={() => setIsOpen(false)}
          section={selectedSection}
        />
      )}
    </>
  );
};
