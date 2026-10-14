export const copyIds = ["a", "b", "c"] as const;

export type CopyId = (typeof copyIds)[number];

export type HeroCopy = {
  id: CopyId;
  label: string;
  name: string;
  lines: string[];
  support: string;
  spoiler: string;
};

export const heroCopies: HeroCopy[] = [
  {
    id: "a",
    label: "A",
    name: "Direta",
    lines: ["Criamos o digital", "que move seu negócio."],
    support:
      "Sites, landing pages e sistemas sob medida. Design e desenvolvimento conectados ao seu próximo passo.",
    spoiler: "O que fazemos.",
  },
  {
    id: "b",
    label: "B",
    name: "Editorial",
    lines: ["Ideias ganham forma.", "Negócios ganham", "presença."],
    support:
      "Da primeira ideia à experiência digital. Criamos websites, páginas de campanha e sistemas personalizados.",
    spoiler: "Ideias em movimento.",
  },
  {
    id: "c",
    label: "C",
    name: "Manifesto",
    lines: ["Muito além", "de estar presente."],
    support:
      "Transformamos necessidades em experiências digitais, unindo identidade, estratégia, design e tecnologia.",
    spoiler: "Da ideia ao digital.",
  },
];

export function getCopy(id: CopyId): HeroCopy {
  return heroCopies.find((item) => item.id === id) ?? heroCopies[0];
}

export function isCopyId(value: string | null): value is CopyId {
  return value === "a" || value === "b" || value === "c";
}
