export type TopicType =
  | "conceptual"
  | "procedural"
  | "representational"
  | "language"
  | "meta";

export interface Topic {
  id: string;
  title: string;
  description: string;
  type: TopicType;
  course_id: string;
  module: string;
  week: number;
  mastery_criteria: string;
  video_id: string;
  video_duration_seconds: number;
}

export type DependencyStrength = "hard" | "soft";

export interface Dependency {
  from: string;
  to: string;
  strength: DependencyStrength;
  reason: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  institution: string;
  level: string;
  subject?: string;
  description: string;
  topic_count: number;
}

export interface CourseDataset {
  course: Course;
  topics: Topic[];
  dependencies: Dependency[];
}
