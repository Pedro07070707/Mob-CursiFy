import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { pickCourseImage } from "../constants/images";
import { useTheme } from "../contexts/ThemeContext";
import courseService from "../services/courseService";
import { Course, CourseMaterial } from "../types";

interface CourseDetailsScreenProps {
  course: Course;
  canEnroll: boolean;
  loading: boolean;
  onBack: () => void;
  onEnroll: () => void;
}

const CATEGORIAS: Record<string, string> = {
  FUNDAMENTAL_1: "Fundamental 1 (1o ao 5o ano)",
  FUNDAMENTAL_2: "Fundamental 2 (6o ao 9o ano)",
  MEDIO_1: "Ensino Medio - 1o ano",
  MEDIO_2: "Ensino Medio - 2o ano",
  MEDIO_3: "Ensino Medio - 3o ano",
  OUTROS: "Outros",
};

export function CourseDetailsScreen({ course, canEnroll, loading, onBack, onEnroll }: CourseDetailsScreenProps) {
  const { theme } = useTheme();
  const imageUri = course.thumbnail_base64 || pickCourseImage(course.category, course.title);
  const [materiais, setMateriais] = useState<CourseMaterial[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    courseService.getContentByCourse(course.course_id)
      .then(setMateriais)
      .catch(() => setMateriais([]))
      .finally(() => setLoadingContent(false));
  }, [course.course_id]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l, paddingBottom: theme.spacing.xxl }}
    >
      <Image source={{ uri: imageUri }} style={[styles.hero, { borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceHighlight, marginBottom: theme.spacing.m }]} />

      <Text style={{ color: theme.colors.primary, fontWeight: "600", fontSize: theme.typography.small }}>
        {CATEGORIAS[course.category] ?? course.category}
      </Text>
      <Text style={{ marginTop: theme.spacing.s, color: theme.colors.textMain, fontSize: theme.typography.h2, fontWeight: "800" }}>{course.title}</Text>
      <Text style={{ marginTop: theme.spacing.s, color: theme.colors.textMuted, fontSize: theme.typography.small }}>Professor: {course.teacher_name}</Text>
      <Text style={{ marginTop: theme.spacing.s, color: theme.colors.textMuted, fontSize: theme.typography.small }}>
        {course.carga_horaria}h de carga horária
      </Text>

      <View style={{ marginTop: theme.spacing.l, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: theme.spacing.m }}>
        <Text style={{ fontSize: theme.typography.body, fontWeight: "700", color: theme.colors.textMain, marginBottom: theme.spacing.s }}>Descrição do curso</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body, lineHeight: 24 }}>{course.description}</Text>
      </View>

      <View style={{ marginTop: theme.spacing.l, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: theme.spacing.m }}>
        <Text style={{ fontSize: theme.typography.body, fontWeight: "700", color: theme.colors.textMain, marginBottom: theme.spacing.s }}>
          📚 Materiais ({materiais.length})
        </Text>
        {loadingContent ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : materiais.length === 0 ? (
          <Text style={{ color: theme.colors.textMuted }}>Nenhum material disponível.</Text>
        ) : (
          materiais.map((mat) => (
            <View key={mat.id} style={{ marginBottom: theme.spacing.m, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.m }}>
              <Text style={{ fontWeight: "700", color: theme.colors.textMain, fontSize: theme.typography.body }}>{mat.titulo}</Text>
              {mat.subtitulo ? (
                <Text style={{ color: theme.colors.primary, fontSize: theme.typography.small, marginTop: 2 }}>{mat.subtitulo}</Text>
              ) : null}
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body, lineHeight: 22, marginTop: theme.spacing.s }}>{mat.conteudo}</Text>
              {mat.link ? (
                <TouchableOpacity onPress={() => Linking.openURL(mat.link)} style={{ marginTop: theme.spacing.s }}>
                  <Text style={{ color: theme.colors.primary, fontSize: theme.typography.small, textDecorationLine: "underline" }} numberOfLines={1}>
                    🔗 {mat.link}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.small, marginTop: 4 }}>
                Status: {mat.statusMaterial}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.actions, { marginTop: theme.spacing.l, gap: theme.spacing.s }]}>
        <AppButton label="Voltar" variant="secondary" onPress={onBack} style={styles.half} testID="course-back" />
        {canEnroll && <AppButton label="Inscrever-se" onPress={onEnroll} loading={loading} style={styles.half} testID="course-enroll" />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { width: "100%", height: 210 },
  actions: { flexDirection: "row" },
  half: { flex: 1 },
});
