export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // <--- Make sure this is lowercase 'v' and lowercase 'u'
  duration: string;
  category: string;
  year: number;
  aiSummary: string;
  tags: string[];
}
// Add this to the bottom of mockData.ts
export const categories = [
  "All",
  "Nature & Wildlife",
  "Science & Space",
  "Technology",
  "Travel & Adventure",
  "Food & Cooking",
  "Education",
  "History",
  "Health & Wellness"
];
export const mockVideos: Video[] = [
  {
    id: "1",
    title: "Wild Kingdom: The Last Frontiers",
    description: "An epic journey through Earth\"s most remote wilderness areas, documenting rare species and forest animals.",
    thumbnail: "https://images.unsplash.com/photo-1719743441581-632023e3d2ff?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
    duration: "58:42",
    category: "Nature & Wildlife",
    year: 2024,
    aiSummary: "Features detailed footage of wildlife behavior and conservation efforts in the deep forest.",
    tags: ["wildlife", "animals", "nature", "forest"]
  },
  {
    id: "2",
    title: "Cosmos Unveiled: Journey to Infinity",
    description: "A breathtaking exploration of our universe and deep space, from black holes to distant galaxies.",
    thumbnail: "https://images.unsplash.com/photo-1650365449083-b3113ff48337?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "62:15",
    category: "Science & Space",
    year: 2024,
    aiSummary: "A cinematic space odyssey exploring the birth of stars and the mechanics of black holes.",
    tags: ["space", "astronomy", "cosmos", "universe"]
  },
  {
    id: "3",
    title: "The AI Revolution: Tech of Today",
    description: "Understanding artificial intelligence and gadgets we use daily, including wireless AirPods.",
    thumbnail: "https://images.unsplash.com/photo-1614651462377-4f3fe3e2c262?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: "55:40",
    category: "Technology",
    year: 2025,
    aiSummary: "Visual breakdown of neural networks and the hardware engineering behind modern tech devices like AirPods.",
    tags: ["tech", "technology", "airpods", "ai"]
  },
  {
    id: "4",
    title: "Urban Explorers: Hidden City Gems",
    description: "A journey through forgotten urban landscapes and secret spots within bustling cities.",
    thumbnail: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "45:10",
    category: "Travel & Adventure",
    year: 2023,
    aiSummary: "Discovering the untold stories and hidden beauty of urban environments.",
    tags: ["urban", "exploration", "city", "adventure"]
  },
  {
    id: "5",
    title: "Culinary Journeys: Flavors of the World",
    description: "Exploring diverse cuisines and culinary traditions from around the globe.",
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "38:25",
    category: "Food & Cooking",
    year: 2022,
    aiSummary: "A gastronomic adventure showcasing unique ingredients and cooking techniques.",
    tags: ["food", "cooking", "cuisine", "travel"]
  },
  {
    id: "6",
    title: "The Art of Code: Programming for Beginners",
    description: "An introductory guide to the fundamentals of programming and software development.",
    thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duration: "60:00",
    category: "Education & Tech",
    year: 2023,
    aiSummary: "Demystifying coding concepts and helping aspiring developers start their journey.",
    tags: ["programming", "coding", "education", "software"]
  },
  {
    id: "7",
    title: "Mindful Living: Paths to Inner Peace",
    description: "Exploring practices and philosophies for a more balanced and peaceful life.",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    duration: "30:45",
    category: "Health & Wellness",
    year: 2024,
    aiSummary: "Guidance on meditation, mindfulness, and stress reduction techniques.",
    tags: ["mindfulness", "wellness", "meditation", "health"]
  },
  {
    id: "8",
    title: "Historic Battles: Turning Points in History",
    description: "Detailed accounts of pivotal battles that shaped the course of human history.",
    thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    duration: "50:00",
    category: "History",
    year: 2021,
    aiSummary: "Analyzing military strategies and the impact of key historical conflicts.",
    tags: ["history", "war", "battles", "military"]
  },
  {
    id: "9",
    title: "Future Cities: Sustainable Urban Design",
    description: "Innovations and concepts for building eco-friendly and smart cities of tomorrow.",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    duration: "40:30",
    category: "Science & Environment",
    year: 2025,
    aiSummary: "Exploring architectural and technological solutions for sustainable urban living.",
    tags: ["urban planning", "sustainability", "architecture", "future"]
  },
  {
    id: "10",
    title: "The Entrepreneur\"s Playbook: Startup Success",
    description: "Insights and strategies for launching and growing a successful startup.",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    duration: "35:00",
    category: "Business & Finance",
    year: 2023,
    aiSummary: "Practical advice for aspiring entrepreneurs on innovation and market entry.",
    tags: ["entrepreneurship", "startup", "business", "innovation"]
  },
  {
    id: "11",
    title: "Wildlife Photography: Capturing Nature\"s Beauty",
    description: "Tips and techniques for stunning wildlife photography in various environments.",
    thumbnail: "https://images.unsplash.com/photo-1516233758813-09749a5049ea?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: "28:15",
    category: "Arts & Hobbies",
    year: 2022,
    aiSummary: "Mastering the art of capturing animals in their natural habitats.",
    tags: ["photography", "wildlife", "nature", "art"]
  },
  {
    id: "12",
    title: "The Science of Sleep: Rest for Success",
    description: "Understanding the importance of sleep and how to improve sleep quality for better health.",
    thumbnail: "https://images.unsplash.com/photo-1535914254981-b50129596489?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    duration: "22:00",
    category: "Health & Wellness",
    year: 2024,
    aiSummary: "Insights into sleep cycles, disorders, and practical tips for restful sleep.",
    tags: ["sleep", "health", "wellness", "science"]
  },
  {
    id: "13",
    title: "Introduction to Quantum Computing",
    description: "An accessible overview of quantum mechanics and its application in computing.",
    thumbnail: "https://images.unsplash.com/photo-1599658880436-afc3b2846e1e?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    duration: "48:00",
    category: "Technology & Science",
    year: 2025,
    aiSummary: "Explaining the basics of qubits, superposition, and quantum entanglement.",
    tags: ["quantum computing", "technology", "science", "physics"]
  },
  {
    id: "14",
    title: "Global Cuisine: A Taste of Italy",
    description: "A culinary journey through Italy, exploring its rich food history and iconic dishes.",
    thumbnail: "https://images.unsplash.com/photo-1516594798947-e65505fdc17f?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "32:00",
    category: "Food & Travel",
    year: 2023,
    aiSummary: "Discovering regional Italian specialties and traditional cooking methods.",
    tags: ["italian food", "cuisine", "travel", "cooking"]
  },
  {
    id: "15",
    title: "The Future of AI: Ethics and Impact",
    description: "Examining the ethical considerations and societal impact of artificial intelligence.",
    thumbnail: "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "55:00",
    category: "Technology & Society",
    year: 2024,
    aiSummary: "Debating the moral implications and future challenges of advanced AI systems.",
    tags: ["AI ethics", "future tech", "society", "philosophy"]
  },
  {
    id: "16",
    title: "Exploring Ancient Civilizations: Egypt",
    description: "Delving into the mysteries and grandeur of ancient Egyptian civilization.",
    thumbnail: "https://images.unsplash.com/photo-1523059623039-a75b39920f19?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    duration: "47:00",
    category: "History & Archaeology",
    year: 2022,
    aiSummary: "Uncovering the secrets of pharaohs, pyramids, and ancient Egyptian culture.",
    tags: ["ancient history", "egypt", "archaeology", "civilizations"]
  },
  {
    id: "17",
    title: "Modern Web Development: React & Beyond",
    description: "A comprehensive guide to building modern web applications with React and related technologies.",
    thumbnail: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "65:00",
    category: "Technology & Education",
    year: 2023,
    aiSummary: "Learning advanced React concepts, state management, and API integration.",
    tags: ["web development", "react", "javascript", "programming"]
  },
  {
    id: "18",
    title: "The Wonders of the Ocean: Marine Life",
    description: "Discovering the incredible biodiversity and ecosystems of the world\"s oceans.",
    thumbnail: "https://images.unsplash.com/photo-1509479119097-f13459495612?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    duration: "50:00",
    category: "Nature & Science",
    year: 2024,
    aiSummary: "Exploring marine biology, coral reefs, and deep-sea creatures.",
    tags: ["ocean", "marine life", "nature", "biology"]
  },
  {
    id: "19",
    title: "Space Exploration: Missions to Mars",
    description: "A look into past, present, and future missions to explore the planet Mars.",
    thumbnail: "https://images.unsplash.com/photo-1517976384-bc77896249d7?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    duration: "42:00",
    category: "Science & Space",
    year: 2025,
    aiSummary: "Chronicling the challenges and discoveries of Martian exploration.",
    tags: ["space", "mars", "nasa", "astronomy"]
  },
  {
    id: "20",
    title: "Healthy Eating: Nutrition for Life",
    description: "Guidance on balanced nutrition, healthy recipes, and dietary habits for well-being.",
    thumbnail: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1080",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    duration: "30:00",
    category: "Health & Lifestyle",
    year: 2023,
    aiSummary: "Understanding macronutrients, micronutrients, and meal planning for a healthy lifestyle.",
    tags: ["nutrition", "health", "diet", "wellness"]
  }
];