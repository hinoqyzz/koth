export type ServiceItem = {
  index: string;
  title: string;
  text: string;
};

export const services: ServiceItem[] = [
  {
    index: "01",
    title: "Presença digital",
    text: "Websites institucionais, sites completos e portfólios.",
  },
  {
    index: "02",
    title: "Campanhas e conversão",
    text: "Landing pages, páginas de lançamento e captação de contatos.",
  },
  {
    index: "03",
    title: "Sistemas sob medida",
    text: "Sistemas internos, ferramentas de gestão e soluções personalizadas.",
  },
];

export const frames = [
  { id: "d1440", label: "Desktop", w: 1440, h: 900 },
  { id: "d1920", label: "Desktop amplo", w: 1920, h: 1080 },
  { id: "l1366", label: "Laptop", w: 1366, h: 768 },
  { id: "t768", label: "Tablet", w: 768, h: 1024 },
  { id: "m390", label: "Mobile", w: 390, h: 844 },
  { id: "m375", label: "Mobile estreito", w: 375, h: 812 },
] as const;

export type FrameId = (typeof frames)[number]["id"];
