import AsyncStorage from "@react-native-async-storage/async-storage";
import courseService from "./courseService";
import { CourseCompletion, Enrollment } from "../types";

const COMPLETION_KEY = "cursify_completions";

type EnrollmentState = Record<string, { enrolled: boolean; status: string; updatedAt: string }>;

function buildStorageKey(userId: string) {
  return `userCourseState:${userId}`;
}

async function getEnrollmentState(userId: string): Promise<EnrollmentState> {
  try {
    const raw = await AsyncStorage.getItem(buildStorageKey(userId));
    return raw ? JSON.parse(raw) as EnrollmentState : {};
  } catch {
    return {};
  }
}

async function saveEnrollmentState(userId: string, state: EnrollmentState) {
  await AsyncStorage.setItem(buildStorageKey(userId), JSON.stringify(state));
}

const enrollmentService = {
  getAll: async (userId: string): Promise<Enrollment[]> => {
    const [state, completionsRaw] = await Promise.all([
      getEnrollmentState(userId),
      AsyncStorage.getItem(COMPLETION_KEY),
    ]);
    const completions: Record<string, { completed: boolean }> = completionsRaw
      ? (JSON.parse(completionsRaw)[userId] ?? {})
      : {};

    const enrolledIds = Object.entries(state)
      .filter(([, entry]) => entry.enrolled)
      .map(([courseId]) => courseId);

    if (enrolledIds.length === 0) return [];

    const courses = await courseService.getAll();

    return enrolledIds
      .map((courseId) => {
        const course = courses.find((item) => item.course_id === courseId);
        if (!course) return null;
        return {
          enrollment_id: `${userId}-${courseId}`,
          enrolled_at: state[courseId]?.updatedAt ?? new Date().toISOString(),
          status: (completions[courseId]?.completed ? "Concluído" : "Em andamento") as "Em andamento" | "Concluído",
          course,
        };
      })
      .filter((item): item is Enrollment => item !== null);
  },

  create: async (userId: string, courseId: string) => {
    const state = await getEnrollmentState(userId);
    state[courseId] = {
      enrolled: true,
      status: "Em progresso",
      updatedAt: new Date().toISOString(),
    };

    await saveEnrollmentState(userId, state);
    return { enrollment_id: `${userId}-${courseId}` };
  },

  getById: (_id: string): Promise<Enrollment> =>
    Promise.reject(new Error("Endpoint nao implementado.")),
  update: (): Promise<void> => Promise.reject(new Error("Endpoint nao implementado.")),
  remove: (): Promise<void> => Promise.reject(new Error("Endpoint nao implementado.")),

  completeCourse: async (userId: string, courseId: string, rating: number, feedback: string): Promise<void> => {
    const raw = await AsyncStorage.getItem(COMPLETION_KEY);
    const map: Record<string, Record<string, CourseCompletion>> = raw ? JSON.parse(raw) : {};
    if (!map[userId]) map[userId] = {};
    map[userId][courseId] = { completed: true, completedAt: new Date().toISOString(), rating, feedback };
    await AsyncStorage.setItem(COMPLETION_KEY, JSON.stringify(map));
  },

  getCompletion: async (userId: string, courseId: string): Promise<CourseCompletion | null> => {
    const raw = await AsyncStorage.getItem(COMPLETION_KEY);
    if (!raw) return null;
    const map: Record<string, Record<string, CourseCompletion>> = JSON.parse(raw);
    return map[userId]?.[courseId] ?? null;
  },

  getAllCompletions: async (userId: string): Promise<Record<string, CourseCompletion>> => {
    const raw = await AsyncStorage.getItem(COMPLETION_KEY);
    if (!raw) return {};
    const map: Record<string, Record<string, CourseCompletion>> = JSON.parse(raw);
    return map[userId] ?? {};
  },
};

export default enrollmentService;
