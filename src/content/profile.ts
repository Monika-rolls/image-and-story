// Everything the home page says about Monika, in one place.
// Facts come from the resume (Nov 2026) and merged pull requests on GitHub; keep them in sync with the PDF.

export const links = {
  email: "kusumonika033@gmail.com",
  linkedin: "https://www.linkedin.com/in/monika-kusumanchi-657217215/",
  github: "https://github.com/Monika-rolls",
  medium: "https://medium.com/@kusumonika033",
  resume: "/Monika_Kusumanchi_Resume.pdf",
};

export type Readout = { value: string; label: string };

export type Featured = {
  title: string;
  kind: string;
  summary: string;
  readouts: Readout[];
  /** aspect = width / height of the file, so the frame never crops or letterboxes it. */
  media?: { type: "video" | "image"; src: string; alt: string; aspect: string; poster?: string };
  links: { label: string; href: string }[];
  stack: string[];
};

export const featured: Featured[] = [
  {
    title: "Mojo",
    kind: "Side project · Android",
    summary:
      "A voice assistant that runs entirely on my own phone: speech to text, phone actions, answers, a camera that can describe and read, and web search only when it's online.",
    readouts: [
      { value: "22–57 ms", label: "phone commands" },
      { value: "0.8 s", label: "camera scan on device" },
      { value: "~5 s", label: "web answer" },
    ],
    media: {
      type: "video",
      src: "/blog/videos/mojo-scan-text.mp4",
      alt: "Screen recording: Mojo reads a receipt, copies a line, then boxes the objects on a milk label",
      aspect: "540 / 1200",
      poster: "/blog/images/mojo-scan-text-poster.jpg",
    },
    links: [{ label: "Read the write-up", href: "/blog/offline-phone-assistant-eyes-and-internet" }],
    stack: ["Kotlin", "Cactus", "llama.cpp", "Qwen3-0.6B", "JNI"],
  },
  {
    title: "Tiny Games",
    kind: "Open source · AI Yatra",
    summary:
      "Took a 21,699-parameter imitation-learning recipe to tic-tac-toe, where the model plays perfectly in every reachable position, and ran the Dino policy on an ESP32 microcontroller.",
    readouts: [
      { value: "100%", label: "optimal moves, all 4,520 positions" },
      { value: "21,699", label: "parameters" },
      { value: "~90 KB", label: "weights on the ESP32" },
    ],
    media: {
      type: "video",
      src: "/blog/videos/tiny-dino-esp32.mp4",
      alt: "Tiny Dino running on an ESP32 with an OLED screen",
      aspect: "474 / 850",
      poster: "/blog/images/tiny-dino-esp32-poster.jpg",
    },
    links: [
      { label: "Read the write-up", href: "/blog/tiny-models-real-games" },
      { label: "Merged pull request", href: "https://github.com/syedazeez337/tiny-dino/pull/1" },
    ],
    stack: ["PyTorch", "C", "ESP32"],
  },
  {
    title: "AI systems at Runo",
    kind: "Production · Sales CRM",
    summary:
      "Outbound voice agents that qualify leads over the phone, a call-analytics pipeline that pulls intent and objections out of every call, and an in-app copilot that answers business questions and acts on the CRM.",
    readouts: [
      { value: "92%", label: "call-insight accuracy" },
      { value: "92% / 88%", label: "copilot retrieval precision / recall" },
    ],
    links: [],
    stack: ["LiveKit", "Gemini", "LangGraph", "Qdrant", "AWS Lambda", "ECS Fargate", "Langfuse"],
  },
];

export type Job = { company: string; role: string; period: string; points: string[]; stack: string };

export const experience: Job[] = [
  {
    company: "Runo",
    role: "AI engineer",
    period: "Apr 2025 – now",
    points: [
      "Designed and deployed outbound voice agents for lead qualification with LiveKit, Gemini, Cartesia and Silero VAD, on AWS Lambda and ECS Fargate with SQS and LiveKit SIP.",
      "Built the STT and LLM pipeline behind call analytics: summaries, sentiment, intent, objections and action items, 92% accurate in its evaluation framework.",
      "Built an in-app copilot that answers business queries and runs CRM actions through agents, APIs and a Qdrant knowledge base: 92% retrieval precision, 88% recall.",
      "Best Performer Award for cutting the cost and raising the accuracy of call analytics.",
    ],
    stack: "Python · LiveKit · Gemini · LangGraph · Qdrant · AWS · Langfuse · Sentry",
  },
  {
    company: "Solivar",
    role: "AI engineer",
    period: "Jun 2024 – Mar 2025",
    points: [
      "Delivered client-facing conversational AI systems and LLM assistants for enterprise workflows.",
      "Designed retrieval workflows and prompt orchestration for multi-step task execution.",
    ],
    stack: "CrewAI · Agno · FastAPI · PostgreSQL · Neo4j · BigQuery",
  },
  {
    company: "CloudKarya",
    role: "ML engineer",
    period: "Jun 2023 – May 2024",
    points: [
      "Shipped applications for medical analytics, restaurant revenue forecasting and image analysis.",
      "Built metadata management to track data flow and pipeline lineage across cloud environments.",
    ],
    stack: "FastAPI · Docker · GCP Cloud Run · BigQuery",
  },
  {
    company: "HomeGround",
    role: "ML intern",
    period: "Mar – May 2023",
    points: ["Detected ball-bat contact in sports footage; feature work raised model accuracy by 40%."],
    stack: "PyTorch · OpenCV",
  },
];

export type Contribution = { title: string; where: string; date: string; detail: string; href: string };

/** Pull requests to other people's projects, newest first. All merged (checked on GitHub, Nov 2026). */
export type PullRequest = { repo: string; number: number; title: string; date: string; href: string; note: string };

export const pullRequests: PullRequest[] = [
  {
    repo: "syedazeez337/tiny-dino",
    number: 1,
    title: "Add Tiny Tic-Tac-Toe and a unified Tiny Games web interface",
    date: "2026-11-07",
    href: "https://github.com/syedazeez337/tiny-dino/pull/1",
    note: "22,281-parameter policy, optimal in all 4,520 decision positions",
  },
  {
    repo: "Entelligence-AI/agentplay",
    number: 69,
    title: "Add Goose parser",
    date: "2026-11-02",
    href: "https://github.com/Entelligence-AI/agentplay/pull/69",
    note: "Decodes Goose 1.10+ sessions from SQLite",
  },
  {
    repo: "Entelligence-AI/agentplay",
    number: 51,
    title: "Add Command Code parser",
    date: "2026-10-27",
    href: "https://github.com/Entelligence-AI/agentplay/pull/51",
    note: "Reads Command Code's per-session JSONL files",
  },
  {
    repo: "AI-Yatra/aiyatra.io",
    number: 3,
    title: "Blog: add the Tiny Dino article",
    date: "2026-10-26",
    href: "https://aiyatra.io/blog/tiny-dino-a-21-699-parameter-policy-that-plays-without-a-safety-net",
    note: "A 21,699-parameter policy that plays with no safety net",
  },
];

/** Open-source projects with more than one contribution get their own card. */
export const openSourceProjects = [
  {
    name: "agentplay",
    owner: "Entelligence AI",
    what: "Replays your coding-agent sessions as a map and a timeline.",
    did: "Opened issues #50 and #66 for two agents agentplay couldn't read yet, then wrote the parsers that closed them: Command Code (one JSONL file per session) and Goose 1.10+ (sessions in SQLite, decoded next to the OpenCode reader). Both merged.",
    readouts: [
      { value: "2", label: "parsers merged" },
      { value: "2", label: "issues opened and closed" },
    ],
    links: [
      { label: "Goose parser, PR #69", href: "https://github.com/Entelligence-AI/agentplay/pull/69" },
      { label: "Command Code parser, PR #51", href: "https://github.com/Entelligence-AI/agentplay/pull/51" },
      { label: "agentplay", href: "https://entelligence.ai/agentplay" },
    ],
    stack: ["Python", "SQLite", "JSONL"],
  },
];

export const community = {
  role: {
    title: "Host and educator, AI Yatra",
    detail:
      "AI Yatra is a community that learns AI in the open and builds it together. I lead sessions for developers on deep learning fundamentals and AI engineering.",
    href: "https://github.com/AI-Yatra",
  },
  teaching: [
    {
      title: "PPO on tic-tac-toe for “SFT to RL”",
      where: "AI-Yatra/sft-to-rl",
      date: "Sep 2026",
      detail:
        "Part 3 of the hands-on session's code: reinforcement learning on tic-tac-toe as runnable Python modules, with a code tour. Session held at LSEG Hyderabad.",
      href: "https://github.com/AI-Yatra/sft-to-rl",
    },
  ] as Contribution[],
  recognition: [
    "Winner, Smart India Hackathon (₹1,00,000)",
    "2nd of 3,150 teams, AI Accenture Hackathon (₹1,00,000)",
    "Finalist, UNESCO India–Africa Hackathon",
    "Best Performer Award, Runo",
  ],
};
