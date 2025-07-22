export const comImages = [
  "Com_1.jpg",
  "Com_2.jpg",
  "Com_3.jpg",
  "Com_4.jpg",
  "Com_5.jpg",
  "Com_6.jpg",
  "Com_7.jpg",
];

export const woodImages = ["1.jpg", "2.jpg"];

export const detailedImages = [
  "1.jpg",
  "2.jpg",
  "4.jpg",
  "5.jpg",
  "6.jpg",
  "7.jpg",
  "8.jpg",
  "9.jpg",
  "10.jpg",
  "11.jpg",
  "12.jpg",
];

export const bigImages = ["1.jpg", "2.jpg"];

export const sectionContent = {
  About: {
    title: "About Playing with Pencil",
    description: `Hi, I'm Jeff — an artist, storyteller, and someone who believes that even the smallest act of kindness can brighten someone's day.
  
  My journey began not with galleries or grand plans, but with a pencil and a quiet seat on the MRT. Sketching strangers was my way of stepping out of fear and into connection. What started as a personal challenge slowly became something more — a way to surprise people with unexpected warmth, to let them feel seen, and to remind them they matter.
  
  I wasn't always confident. I was once the kid who got bullied for how I looked, who tried to stay invisible. But art gave me a voice. A sketch, for me, isn't just a drawing — it's a gift, a moment shared between strangers. A simple "thank you" means the world to me.
  
  Now, I'm continuing this project with the dream of reaching more people — through faces, through feelings, through honest human moments. I believe people are inherently good. And if my sketch can remind someone of that, even for a second, then I've done what I set out to do.
  
  Let's keep creating small magic, one sketch at a time.`,
    npc: "/sprites/smile/0/jump_0.png",
    level: "",
    buttons: ["LEARN MORE", "JOIN DISCORD", "WATCH TRAILER", "SHARE"],
  },
  Shop: {
    title: "Portrait Studio Services",
    description: `Welcome to Playing With Pencil's Portrait Studio, where each sketch tells a unique story captured in time.
  
  Our Services:
  
  🎨 Event Sketches
  Live sketching at your events, capturing special moments in real-time. Perfect for corporate events, weddings, and special occasions.
  
  👤 Portrait Commissions
  Custom portraits created with attention to detail and personal style. Each piece is crafted to capture the essence of your story.
  
  🎭 Live Portrait Events
  Interactive portrait sessions at events and gatherings. Watch as your portrait comes to life before your eyes.
  
  💻 Digital Portraits
  Modern digital artwork perfect for social media and prints. High-quality digital versions of your portraits.
  
  🏢 Corporate Events
  Professional sketching services for corporate events and team building. Add a unique touch to your company gatherings.
  
  💑 Wedding Sketches
  Capture your special day with beautiful live wedding sketches. Create lasting memories of your celebration.
  
  What You Get:
  • Professional Quality: High-quality artwork with premium materials
  • Quick Turnaround: Fast delivery without compromising quality
  • Digital Copies: Easy sharing and printing options
  • Customization: Personalized artwork for your needs
  
  Each portrait is more than just a drawing—it's a moment frozen in time, a story waiting to be told. Let me help you create your own unique piece of art.`,
    npc: "/sprites/smile/0/jump_0.png",
    level: "Professional Services",
    buttons: ["BOOK NOW", "VIEW GALLERY", "PRICING", "CONTACT"],
  },
  "Art & Event": {
    title: "Art & Events Gallery",
    services: [
      {
        name: "Customisation Sketches",
        description:
          "Choose from our different styles of personalized sketches. Each style offers a unique artistic approach to capture your special moments.",
        examples: [
          {
            name: "Quick Sketches",
            description:
              "Fast and expressive sketches perfect for capturing moments on the go.",
            examples: comImages.map((img) => ({
              type: "image",
              src: `/gallery/quick/${img}`,
              caption: img.replace(/_/g, " ").replace(".jpg", ""),
            })),
            dynamic: true,
          },
          {
            name: "Wood Sketches",
            description:
              "Unique sketches on wood surfaces, creating rustic and natural artwork with a distinctive texture.",
            examples: woodImages.map((img) => ({
              type: "image",
              src: `/gallery/wood/${img}`,
              caption: img.replace(/_/g, " ").replace(".jpg", ""),
            })),
            dynamic: true,
          },
          {
            name: "Detailed Portraits",
            description:
              "Intricate and detailed portraits with careful attention to every feature and expression.",
            examples: detailedImages.map((img) => ({
              type: "image",
              src: `/gallery/detailed/${img}`,
              caption: img.replace(/_/g, " ").replace(".jpg", ""),
            })),
            dynamic: true,
          },
        ],
        dynamic: true,
      },
      // {
      //   name: "Social Media Videos",
      //   description:
      //     "Short videos showcasing the sketching process, perfect for sharing on social media.",
      //   examples: [
      //     {
      //       type: "video",
      //       src: "/gallery/video1.mp4",
      //       caption: "Time-lapse Sketch",
      //     },
      //   ],
      // },
      // {
      //   name: "Event Boothing",
      //   description:
      //     "Live sketching at events and booths. Engage your guests with on-the-spot art.",
      //   examples: [
      //     {
      //       type: "image",
      //       src: "/gallery/event1.jpg",
      //       caption: "Corporate Event",
      //     },
      //   ],
      // },
    ],
    npc: "/sprites/smile/0/jump_0.png",
    level: "",
    buttons: ["BOOK NOW", "VIEW GALLERY", "EVENT CALENDAR", "JOIN EVENT"],
  },
  // Contact: {
  //   title: "Contact Us",
  //   description:
  //     "Have questions or suggestions? Reach out to us through our various channels. We'd love to hear from you!",
  //   npc: "/sprites/smile/0/jump_0.png",
  //   level: "All Levels",
  //   buttons: ["SEND MESSAGE", "FAQ", "SUPPORT", "FEEDBACK"],
  // },
};

export const videoPrompt =
  "Transform this doodle into an animated, artistic scene. Begin with the original sketch, then evolve it into a richly detailed, stylized version using painterly textures, expressive brushstrokes, and creative visual elements. Maintain the core subject while adding flowing, imaginative motion that brings the drawing to life.";
