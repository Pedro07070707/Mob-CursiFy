import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { Course, CreateCoursePayload } from "../types";

interface BackendCourse {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  cargaHoraria: number;
  dataCriacao: string;
  statusCurso: string | boolean;
}

function isCourseActive(status: BackendCourse["statusCurso"]) {
  return status === true || status === "Ativo";
}

function normalizeLevel(category: string): Course["level"] {
  if (category?.includes("MEDIO")) return "intermediate";
  return "beginner";
}

function mapCourse(course: BackendCourse): Course {
  return {
    course_id: String(course.id),
    teacher_id: "",
    teacher_name: "Professor CursiFy",
    title: course.nome,
    category: course.categoria,
    description: course.descricao,
    pedagogy_description: course.descricao,
    level: normalizeLevel(course.categoria),
    lessons_count: 0,
    estimated_hours: Number(course.cargaHoraria) || 0,
    thumbnail_base64: "",
    enrolled_count: 0,
    created_at: course.dataCriacao ?? new Date().toISOString(),
    video_links: [],
    site_links: [],
  };
}

const LINKS_KEY = "cursify_course_links";

async function loadLinksMap(): Promise<Record<string, { video_links: string[]; site_links: string[] }>> {
  try {
    const raw = await AsyncStorage.getItem(LINKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveLinks(courseId: string, video_links: string[], site_links: string[]) {
  const map = await loadLinksMap();
  map[courseId] = { video_links, site_links };
  await AsyncStorage.setItem(LINKS_KEY, JSON.stringify(map));
}

const courseService = {
  getAll: async (category?: string) => {
    const [response, linksMap] = await Promise.all([
      api.get<BackendCourse[]>("/curso"),
      loadLinksMap(),
    ]);
    return response.data
      .filter((course) => isCourseActive(course.statusCurso))
      .map((course) => ({
        ...mapCourse(course),
        ...(linksMap[String(course.id)] ?? { video_links: [], site_links: [] }),
      }))
      .filter((course) => !category || course.category === category);
  },

  getById: async (courseId: string) => {
    const [response, linksMap] = await Promise.all([
      api.get<BackendCourse>(`/curso/${courseId}`),
      loadLinksMap(),
    ]);
    return {
      ...mapCourse(response.data),
      ...(linksMap[courseId] ?? { video_links: [], site_links: [] }),
    };
  },

  create: async (payload: CreateCoursePayload) => {
    const response = await api.post<BackendCourse>("/curso", {
      nome: payload.title,
      descricao: payload.description,
      categoria: payload.category,
      cargaHoraria: payload.estimated_hours,
      dataCriacao: new Date().toISOString(),
      statusCurso: "Ativo",
    });
    const course = mapCourse(response.data);
    await saveLinks(course.course_id, payload.video_links ?? [], payload.site_links ?? []);
    return { ...course, video_links: payload.video_links ?? [], site_links: payload.site_links ?? [] };
  },

  update: (_courseId: string, _payload: Partial<CreateCoursePayload>): Promise<Course> =>
    Promise.reject(new Error("Endpoint nao implementado.")),

  remove: (courseId: string) =>
    api.delete<void>(`/curso/${courseId}`).then(() => undefined),

  getProfessorCourses: () => courseService.getAll(),
};

export default courseService;
