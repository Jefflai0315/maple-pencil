export interface CourseLesson {
  day: number;
  title: string;
  subtitle: string;
  tip: string;
  imagePath: string;
  suggestedOpacity: number;
  useStrobe: boolean;
}

export const FACE_COURSE: CourseLesson[] = [
  {
    day: 1,
    title: "Face Shape",
    subtitle: "Oval & eye placement",
    tip: "Trace the oval first. Don't worry about details — get the proportions right.",
    imagePath: "/course/face-day1.svg",
    suggestedOpacity: 0.45,
    useStrobe: false,
  },
  {
    day: 2,
    title: "Eyes",
    subtitle: "Shape, pupils & brows",
    tip: "Eyes sit halfway down the head. Leave equal space between them.",
    imagePath: "/course/face-day2.svg",
    suggestedOpacity: 0.5,
    useStrobe: true,
  },
  {
    day: 3,
    title: "Nose",
    subtitle: "Bridge, nostrils & shadow",
    tip: "The nose is smaller than you think. Light lines first, darken later.",
    imagePath: "/course/face-day3.svg",
    suggestedOpacity: 0.55,
    useStrobe: true,
  },
  {
    day: 4,
    title: "Lips",
    subtitle: "Upper lip, lower lip & line",
    tip: "The mouth sits one-third of the way from nose to chin.",
    imagePath: "/course/face-day4.svg",
    suggestedOpacity: 0.5,
    useStrobe: true,
  },
  {
    day: 5,
    title: "Full Portrait",
    subtitle: "Put it all together",
    tip: "Trace the full face. Use strobe mode to check your drawing against the guide.",
    imagePath: "/course/face-day5.svg",
    suggestedOpacity: 0.4,
    useStrobe: true,
  },
];

export function getCourseLesson(day: number): CourseLesson | null {
  return FACE_COURSE.find((lesson) => lesson.day === day) ?? null;
}
