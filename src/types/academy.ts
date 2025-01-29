export interface CourseChapter {
  description: string;
  lesson: string;
  title: string;
}

export interface Course {
  id: string;
  chapters?: CourseChapter[];
  description: string;
  duration: string;
  media?: string;
  progress: number;
  title: string;
}
