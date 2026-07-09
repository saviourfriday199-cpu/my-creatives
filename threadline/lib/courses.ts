import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Course, Topic, Dependency, CourseDataset } from "./types";

const DATA_DIR = join(process.cwd(), "data");

function readJSON<T>(...segments: string[]): T {
  return JSON.parse(readFileSync(join(DATA_DIR, ...segments), "utf8")) as T;
}

export function getCourses(): Course[] {
  return readJSON<Course[]>("courses.json");
}

export function getCourse(courseId: string): Course | undefined {
  return getCourses().find((c) => c.id === courseId);
}

export function getCourseDataset(courseId: string): CourseDataset | undefined {
  const course = getCourse(courseId);
  if (!course) return undefined;
  const topics = readJSON<Topic[]>(courseId, "topics.json");
  const dependencies = readJSON<Dependency[]>(courseId, "dependencies.json");
  return { course, topics, dependencies };
}

export function getTopic(
  courseId: string,
  topicId: string,
): { dataset: CourseDataset; topic: Topic } | undefined {
  const dataset = getCourseDataset(courseId);
  if (!dataset) return undefined;
  const topic = dataset.topics.find((t) => t.id === topicId);
  if (!topic) return undefined;
  return { dataset, topic };
}

/** Aggregate stats for the whole platform, used by the landing hero. */
export function getPlatformStats() {
  const courses = getCourses();
  let topics = 0;
  let edges = 0;
  for (const c of courses) {
    const ds = getCourseDataset(c.id);
    if (ds) {
      topics += ds.topics.length;
      edges += ds.dependencies.length;
    }
  }
  return { courses: courses.length, topics, edges };
}
