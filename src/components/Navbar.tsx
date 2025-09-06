import { useState, useEffect } from "react";
import QuestPopup from "./QuestPopup";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("About");

  // Read URL parameter on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get("section");

      // Map URL parameters to navbar sections
      let initialSection = ""; // default

      if (section) {
        // Decode URL parameters properly
        const decodedSection = decodeURIComponent(section);

        switch (decodedSection.toLowerCase()) {
          case "shop":
            initialSection = "Shop";
            break;
          case "about":
            initialSection = "About";
            break;
          case "art":
          case "event":
          case "art&event":
          case "art%26event": // URL encoded version
            initialSection = "Art & Event";
            break;
          default:
            initialSection = "About";
        }
      }

      setSelectedSection(initialSection);

      // Show popup for any section when navigating via URL
      if (initialSection) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleClick = (item: string) => {
    if (item === selectedSection) {
      // If clicking the same tab, toggle the popup
      setIsOpen(!isOpen);
    } else {
      // If clicking a different tab, switch to it and keep popup open
      setSelectedSection(item);
      setIsOpen(true);
    }

    // Update URL parameter when section changes
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let sectionParam = "about"; // default

      switch (item) {
        case "Shop":
          sectionParam = "shop";
          break;
        case "About":
          sectionParam = "about";
          break;
        case "Art & Event":
          sectionParam = "art%26event"; // URL encode the & character
          break;
        default:
          sectionParam = "about";
      }

      url.searchParams.set("section", sectionParam);
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
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
            className="sketch-btn"
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
