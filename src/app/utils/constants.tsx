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
    title: "Customisation Sketches",
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

//Mural ART Themes

export const videoPrompts = [
  "Create a quick artistic video with smooth camera movements",
  "Turn this sketch into an animated, artistic scene. Keep the main subject, but enhance it with wholesome story, and creative motion.",
  "Transform this doodle into an animated, artistic scene. Begin with the original sketch, then evolve it into a richly detailed, stylized version using painterly textures, expressive brushstrokes, and creative visual elements. Maintain the core subject while adding flowing, imaginative motion that brings the drawing to life.",
];

export const muralPromptThemes = [
  {
    title: "My Kampung Memory",
    description: "Sketch old Sembawang’s heritage:",
    prompts: [
      "Wooden jetties at Sembawang Park",
      "Rambutan trees in backyard gardens",
      "Provision shops like 'Ah Huat Grocery'",
    ],
  },
  {
    title: "Neighbourhood Heroes",
    description: "Celebrate local community figures:",
    prompts: [
      "Uncle selling kacang putih at Sembawang Mart",
      "Aunty tending flowers at Yishun Ave balcony gardens",
      "Bus captain on Service 882",
    ],
  },
  {
    title: "Sembawang’s Natural Treasures",
    description: "Capture unique local biodiversity:",
    prompts: [
      "Mangrove crabs at Sungei Sembawang",
      "Herons at the former Sembawang Shipyard coast",
      "Rain trees along Canberra Road",
    ],
  },
  {
    title: "Festival Lights at Our Void Deck",
    description: "Multicultural celebrations:",
    prompts: [
      "Deepavali kolam patterns near Sembawang CCD",
      "Chinese New Year pineapple tarts exchange",
      "Hari Raya ketupat weaving sessions",
    ],
  },
  {
    title: "Future Sembawang Dreams",
    description: "Imagine tomorrow’s neighbourhood:",
    prompts: [
      "Eco-friendly HDBs with vertical farms",
      "High-speed water taxis to Pulau Seletar",
      "Fusion hawker center (chilli crab prata!)",
    ],
  },
  {
    title: "Simple Object Prompts (Easy for All Ages)",
    description: "Quick, accessible ideas:",
    prompts: [
      "Your favourite teh peng cup from Sembawang Food Centre",
      "Grandpa’s bicycle with bakul basket",
      "The red postbox outside Sembawang MRT",
      "Blue mosaic playground tiles from your childhood",
    ],
  },
  {
    title: "Interactive Prompt Ideas",
    description: "Get creative with before/after and personal stories:",
    prompts: [
      "Before/After: Old Sembawang Hot Springs vs. new NS Square",
      "My Block Story: Window view from your HDB",
      "Memorable moment at your corridor (e.g., makan session during COVID)",
    ],
  },
  {
    title: "Real Sembawang References to Inspire",
    description: "Draw from local history and places:",
    prompts: [
      "Shipyard Legacy: Cranes, naval workers’ helmets, dockyard tools",
      "Military Heritage: Old RAF barracks, camouflage patterns",
      "Coastal Life: Fishing rods at Simpang Beach, kelongs silhouette",
    ],
  },
  {
    title: "My Daily Life in Sembawang",
    description: "Encourage simple scenes from everyday routines:",
    prompts: [
      "Sketch your favorite moment of the day — morning kopi, a walk in the park, or your pet waiting at home.",
      "Draw your journey to school or work — MRT ride, bus stop, or a bustling kopi shop.",
      "Show what your HDB block feels like at sunset or during rainy days.",
    ],
  },
  {
    title: "Local Treasures & Hidden Gems",
    description: "Highlight iconic or personal places in Sembawang:",
    prompts: [
      "Draw your favorite place in Sembawang — the beach, hot spring park, or a quiet corner in the neighborhood.",
      "Sketch a memory at the old Sembawang Shipyard, Sun Plaza, or the park connector.",
      "Reimagine a familiar place in your own artistic style — turn Sembawang Park into a fantasy world.",
    ],
  },
  {
    title: "Food & Family",
    description: "Food is a powerful part of Singaporean identity:",
    prompts: [
      "Sketch a meal that reminds you of home — chicken rice, satay, nasi lemak, or mom's cooking.",
      "Draw your family gathering around food during Hari Raya, Chinese New Year, or Deepavali.",
      "Turn your hawker center into an art piece — with dancing dishes or flying roti prata.",
    ],
  },
  {
    title: "Singapore Stories & Traditions",
    description: "Connect with cultural roots and national identity:",
    prompts: [
      "Sketch something that represents your heritage or festive traditions.",
      "Draw a childhood game or local tradition you remember — five stones, kite flying, lion dance.",
      "Show how you celebrate National Day with your neighbors or at school.",
    ],
  },
  {
    title: "Dreams & Future Visions",
    description: "Let people be imaginative and personal:",
    prompts: [
      "Sketch your dream for Sembawang — more greenery, floating homes, robot uncles?",
      "Draw how you imagine life in Singapore in 50 years.",
      "What does happiness look like to you? Try sketching it.",
    ],
  },
  {
    title: "Friendly for All Ages",
    description: "Playful variations for kids:",
    prompts: [
      "Draw your superhero version of yourself in Sembawang.",
      "Imagine if animals took over Sun Plaza — sketch it!",
      "Design your own MRT station or train.",
    ],
  },
];
