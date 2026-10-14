export type ShardBox = {
  left: string;
  top: string;
  width: string;
  height: string;
  radius: string;
  tone: "back" | "mid" | "front";
};

export type PreloaderAct = {
  index: string;
  title: string;
  time: string;
  text: string;
  shards: ShardBox[];
  showLogo: boolean;
};

export const preloaderActs: PreloaderAct[] = [
  {
    index: "01",
    title: "Presença",
    time: "0,0s",
    text: "Fundo sólido. Três volumes surgem separados, com profundidade e silêncio visual.",
    showLogo: false,
    shards: [
      { left: "10%", top: "16%", width: "22%", height: "38%", radius: "18px", tone: "back" },
      { left: "62%", top: "62%", width: "28%", height: "16%", radius: "16px", tone: "mid" },
      { left: "70%", top: "14%", width: "18%", height: "24%", radius: "18px", tone: "front" },
    ],
  },
  {
    index: "02",
    title: "Convergência",
    time: "0,9s",
    text: "Os volumes se deslocam com pequena defasagem, sem elástico, até uma relação geométrica.",
    showLogo: false,
    shards: [
      { left: "22%", top: "24%", width: "22%", height: "36%", radius: "18px", tone: "back" },
      { left: "40%", top: "46%", width: "34%", height: "16%", radius: "16px", tone: "mid" },
      { left: "58%", top: "28%", width: "20%", height: "26%", radius: "18px", tone: "front" },
    ],
  },
  {
    index: "03",
    title: "Identidade",
    time: "2,1s",
    text: "A composição lembra o ritmo modular da marca. O logo oficial entra intacto, por cima.",
    showLogo: true,
    shards: [
      { left: "28%", top: "22%", width: "24%", height: "46%", radius: "18px", tone: "back" },
      { left: "34%", top: "42%", width: "40%", height: "16%", radius: "16px", tone: "mid" },
      { left: "52%", top: "48%", width: "26%", height: "30%", radius: "20px", tone: "front" },
    ],
  },
  {
    index: "04",
    title: "Revelação",
    time: "3,2s",
    text: "Os volumes crescem e funcionam como máscara. Headline, navbar e índices entram em sequência.",
    showLogo: false,
    shards: [
      { left: "-8%", top: "-12%", width: "34%", height: "70%", radius: "22px", tone: "back" },
      { left: "18%", top: "38%", width: "70%", height: "22%", radius: "20px", tone: "mid" },
      { left: "62%", top: "8%", width: "48%", height: "54%", radius: "24px", tone: "front" },
    ],
  },
];
