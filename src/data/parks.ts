export type Park = { id: string; name: string };

export const PARKS: Park[] = [
  { id: "southford", name: "Southford Falls" },
];

export const parkName = (id: string) => PARKS.find((park) => park.id === id)?.name ?? id;
