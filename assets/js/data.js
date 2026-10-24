// Single source of truth for site content. Edit here; the page renders from it.

export const profile = {
  name: 'Alen Joy',
  handle: 'ALEN_TJ',
  role: 'Cybersecurity & Software Engineering',
  tagline: 'Security-first. Builder by nature.',
  summary:
    'I build systems and then try to break them. My work sits where software architecture meets low-level hardware — IoT nodes, edge AI and the networks between them — and every layer is designed to hold when the one above it fails.',
  objective:
    'Looking to join a forward-thinking engineering team where cross-stack development and rigorous security principles are the same job.',
  email: 'mail2alentj@gmail.com',
  location: 'Kerala, India',
  status: 'Available for opportunities',
  links: [
    { label: 'GitHub', href: 'https://github.com/Alentj' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/alen-tj' },
    { label: 'Instagram', href: 'https://instagram.com/alen.tj_' },
  ],
};

// Every project is drawn as a small left-to-right system diagram.
// `flow` is a list of stages; a stage can be a single node or an array (parallel nodes).
export const projects = [
  {
    id: 'smartagri',
    title: 'SmartAgri',
    short: 'SmartAgri',
    subtitle: '7-Layer Secured IoT Ecosystem',
    disciplines: ['security', 'hardware'],
    year: '2026',
    repo: 'https://github.com/Alentj/iOT-Security',
    summary:
      'Precision-agriculture monitoring built as a defense-in-depth case study. Every sensor reading from an ESP8266 node must clear seven independent security layers before it is stored, charted or allowed to trigger irrigation.',
    points: [
      'Fixed-window rate limiting throttles DDoS and brute-force traffic',
      'Hardware handshake authenticates each device before any data is accepted',
      'Replay protection, anomaly detection and IP blacklisting at the server',
      'Strict schema validation as the last gate before MongoDB',
      'Real-time Chart.js dashboard with automated irrigation control',
    ],
    stack: ['Node.js', 'MongoDB', 'ESP8266', 'Chart.js', 'Telegram API'],
    flow: ['ESP8266', 'Tunnel', ['L1 Rate', 'L2 Auth', 'L4 Replay', 'L7 Schema'], 'MongoDB', 'Dashboard'],
  },
  {
    id: 'reconshield',
    title: 'ReconShield',
    short: 'ReconShield',
    subtitle: 'AI-Powered Vulnerability Assessment',
    disciplines: ['security', 'ai'],
    year: '2026',
    repo: 'https://github.com/Alentj/Reconshield',
    summary:
      'A vulnerability assessment pipeline and security dashboard. ReconShield gathers reconnaissance on a target, runs scans, and uses AI to triage and explain findings so they can be acted on rather than just listed.',
    points: [
      'Automated reconnaissance and scanning of a target surface',
      'AI-assisted triage that ranks and explains findings',
      'Single dashboard view of the security posture',
    ],
    stack: ['Python', 'AI / LLM', 'Security tooling'],
    flow: ['Target', ['Recon', 'Scan'], 'AI Triage', 'Dashboard'],
  },
  {
    id: 'truthlens',
    title: 'Deepfake & Fake News Detection',
    short: 'Deepfake Detect',
    subtitle: 'Two-model media-integrity dashboard',
    disciplines: ['ai', 'security'],
    year: '2025',
    repo: 'https://github.com/Alentj/Deepfake-FakeNews-Detection',
    summary:
      'A web dashboard that answers two questions: is this image real, and is this story real? Images go through a CNN classifier; news is pulled from seven providers and judged by a zero-shot transformer.',
    points: [
      'TensorFlow / Keras CNN classifies uploaded images as real or deepfake, with confidence',
      'Zero-shot classification with facebook/bart-large-mnli for news authenticity',
      'Aggregates NewsAPI, GNews, Mediastack, Bing, NYT, Guardian and Currents',
      'Fallback labelling when no corroborating source exists',
    ],
    stack: ['Python', 'Flask', 'TensorFlow', 'Transformers'],
    flow: [['Image', 'Keyword'], ['CNN', '7 News APIs'], ['Verdict', 'BART-MNLI'], 'Dashboard'],
  },
  {
    id: 'wheelchair',
    title: 'Smart Wheelchair',
    short: 'Wheelchair',
    subtitle: 'Voice-controlled mobility for paralysed users',
    disciplines: ['hardware'],
    year: '2023',
    repo: 'https://github.com/Alentj/Smart-Wheelchair',
    summary:
      'A voice-controlled wheelchair built from scratch: speech captured on a phone is pushed through Firebase to an Arduino over Wi-Fi, which drives four motors through a motor driver.',
    points: [
      'Phone captures voice commands and writes them to Firebase in real time',
      'Wi-Fi module on the Arduino reads commands and drives the motor controller',
      'Four-motor chassis on a rechargeable battery pack, soldered and wired by hand',
    ],
    stack: ['Arduino', 'Firebase', 'Wi-Fi module', 'Motor driver'],
    flow: ['Voice', 'Firebase', 'Wi-Fi', 'Arduino', 'Motors'],
  },
  {
    id: 'fish',
    title: 'Fish Identifier AI',
    short: 'Fish ID',
    subtitle: 'Species recognition from a photo',
    disciplines: ['ai'],
    year: '2025',
    repo: 'https://github.com/Alentj/Fish-Identifier-AI',
    summary:
      'An image-classification model that identifies fish species from a photograph — a small, focused computer-vision build.',
    points: ['Image preprocessing and model inference in Python', 'Predicts species with a confidence score'],
    stack: ['Python', 'Computer vision'],
    flow: ['Photo', 'Preprocess', 'Model', 'Species'],
  },
];

export const disciplines = [
  { id: 'all', label: 'All' },
  { id: 'security', label: 'Security' },
  { id: 'ai', label: 'AI / ML' },
  { id: 'hardware', label: 'Hardware' },
];

// Skills. `uses` links each one to project ids; the skills network draws those links.
export const stack = [
  { item: 'Python', kind: 'Language', uses: ['reconshield', 'truthlens', 'fish'] },
  { item: 'JavaScript / Node.js', kind: 'Language', uses: ['smartagri', 'wheelchair'] },
  { item: 'C++ / Arduino', kind: 'Language', uses: ['wheelchair', 'smartagri'] },
  { item: 'Bash', kind: 'Language', uses: [] },
  { item: 'TensorFlow / Keras', kind: 'ML', uses: ['truthlens', 'fish'] },
  { item: 'Hugging Face Transformers', kind: 'ML', uses: ['truthlens'] },
  { item: 'Flask', kind: 'Framework', uses: ['truthlens'] },
  { item: 'MongoDB', kind: 'Data', uses: ['smartagri'] },
  { item: 'Firebase', kind: 'Data', uses: ['wheelchair'] },
  { item: 'ESP8266 / microcontrollers', kind: 'Hardware', uses: ['smartagri', 'wheelchair'] },
  { item: 'Kali Linux', kind: 'Security', uses: ['reconshield'] },
  { item: 'Docker', kind: 'Infra', uses: [] },
];

// The hero diagram's security layers (from SmartAgri) and the attacks each one stops.
export const layers = [
  { id: 'L1', name: 'Rate limit', stops: 'flood', msg: 'request flood — 100 req/min window exceeded' },
  { id: 'L2', name: 'Device auth', stops: 'spoof', msg: 'unknown device — hardware handshake failed' },
  { id: 'L3', name: 'Telegram shield', stops: null, msg: '' },
  { id: 'L4', name: 'Replay guard', stops: 'replay', msg: 'nonce reused — replayed packet' },
  { id: 'L5', name: 'Anomaly', stops: 'anomaly', msg: 'reading out of physical range' },
  { id: 'L6', name: 'IP blacklist', stops: 'blacklisted', msg: 'source IP on blacklist' },
  { id: 'L7', name: 'Schema', stops: 'malformed', msg: 'payload failed schema validation' },
];

export const attacks = ['flood', 'spoof', 'replay', 'anomaly', 'blacklisted', 'malformed'];
