export const EMOTES = ["😀", "😂", "😍", "😮", "😢", "😡", "👍", "🙏"];

export const STICKERS = [
  {
    name: "Burst",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='160' height='160' rx='24' fill='%23FDE047'/><path d='M80 22l11 26 28 3-21 19 6 27-24-14-24 14 6-27-21-19 28-3z' fill='%230F172A'/></svg>",
    type: "image/svg+xml",
  },
  {
    name: "Wave",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='160' height='160' rx='24' fill='%2360A5FA'/><path d='M20 90c20-20 40 20 60 0s40 20 60 0' stroke='%23FFFFFF' stroke-width='12' fill='none' stroke-linecap='round'/></svg>",
    type: "image/svg+xml",
  },
  {
    name: "Bolt",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='160' height='160' rx='24' fill='%23F97316'/><path d='M92 20L48 92h28l-8 48 44-72H84z' fill='%230F172A'/></svg>",
    type: "image/svg+xml",
  },
  {
    name: "Leaf",
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='160' height='160' rx='24' fill='%2322C55E'/><path d='M112 44c-36 2-60 22-64 60 30-8 48-28 64-60z' fill='%230F172A'/><path d='M48 104c16-8 32-10 48-8' stroke='%230F172A' stroke-width='10' stroke-linecap='round'/></svg>",
    type: "image/svg+xml",
  },
];

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDay = (value) =>
  new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
