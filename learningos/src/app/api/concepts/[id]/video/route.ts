import type { NextRequest } from "next/server";
import { json, route, error } from "@/lib/http";
import { requireRole, assertUniversityScope } from "@/lib/auth/current-user";
import { setVideoSchema } from "@/lib/validators";
import { getConcept, getCourseScope } from "@/lib/curriculum/service";
import { setConceptVideo } from "@/lib/content/service";
import { fetchYouTubeMetadata } from "@/lib/youtube/metadata";

type Ctx = { params: Promise<{ id: string }> };

/** Link a YouTube video to a concept. Lecturer+ within the course's university. */
export const POST = route(async (req: NextRequest, ctx: Ctx) => {
  const user = await requireRole("lecturer");
  const { id } = await ctx.params;
  const concept = await getConcept(id);
  if (!concept) return error("Concept not found", 404);
  const scope = await getCourseScope(concept.courseId);
  if (!scope) return error("Course not found", 404);
  assertUniversityScope(user, scope.universityId);

  const { url } = setVideoSchema.parse(await req.json());
  const { videoId } = await setConceptVideo(id, url);
  const metadata = await fetchYouTubeMetadata(videoId);
  return json({ videoId, metadata });
});
