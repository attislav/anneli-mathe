export const LAB_TOPIC_IDS = ["tiles", "survey", "bus", "window", "machine", "cubes", "shopping", "calendar", "pairs", "route"] as const;
export type LabTopic = typeof LAB_TOPIC_IDS[number];

export function schoolTopics(value: unknown): LabTopic[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((id): id is LabTopic => LAB_TOPIC_IDS.some(known => id === known));
  const unique = [...new Set(valid)].slice(0, 3);
  return unique.length >= 2 ? unique : [];
}
