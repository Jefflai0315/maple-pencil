/** A ready-made picture that opens in the trace tool with a tip. */
export interface CourseLesson {
  id: string;
  /** Small label above the title, e.g. "Draw-along". */
  label: string;
  title: string;
  subtitle: string;
  tip: string;
  imagePath: string;
  suggestedOpacity: number;
  useStrobe: boolean;
}

/** The eye from Jeff's "draw a real eye in 4 steps" reel. */
export const EYE_LESSON: CourseLesson = {
  id: "eye",
  label: "Draw-along",
  title: "A real eye in 4 steps",
  subtitle: "Box it · lines · 4 tones · blend",
  tip: "Box it first and split it in half, then half again. Straight lines before curves.",
  imagePath: "/home/eye/reference-trace.jpg",
  suggestedOpacity: 0.5,
  useStrobe: false,
};

export const LESSONS: Record<string, CourseLesson> = {
  [EYE_LESSON.id]: EYE_LESSON,
};
