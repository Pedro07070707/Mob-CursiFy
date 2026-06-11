import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { CourseCard } from "../components/CourseCard";
import { useTheme } from "../contexts/ThemeContext";
import { Course } from "../types";

interface TeacherScreenProps {
  canManage: boolean;
  title: string; setTitle: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  cargaHoraria: string; setCargaHoraria: (v: string) => void;
  loading: boolean;
  onCreateCourse: () => void;
  courses: Course[];
  onOpenCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function TeacherScreen(props: TeacherScreenProps) {
  const { theme } = useTheme();

  if (!props.canManage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l, gap: theme.spacing.s }]}>
        <Text style={{ fontSize: theme.typography.h2, color: theme.colors.textMain, fontWeight: "700" }}>Área de professor</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body }}>Este perfil não tem permissão para criar cursos.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l, paddingBottom: theme.spacing.xxl }}
      data={props.courses}
      keyExtractor={(item) => item.course_id}
      ListHeaderComponent={
        <View style={{ borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, padding: theme.spacing.m, marginBottom: theme.spacing.l }}>
          <Text style={{ color: theme.colors.textMain, fontSize: theme.typography.h2, fontWeight: "700" }}>Criar novo curso</Text>
          <Text style={{ marginTop: theme.spacing.s, marginBottom: theme.spacing.m, color: theme.colors.textMuted, fontSize: theme.typography.body }}>
            Preencha os dados pedagógicos para publicar no catálogo.
          </Text>
          <AppInput label="Nome" value={props.title} onChangeText={props.setTitle} testID="teacher-title" />
          <AppInput label="Categoria" value={props.category} onChangeText={props.setCategory} testID="teacher-category" />
          <AppInput label="Descrição" value={props.description} onChangeText={props.setDescription} testID="teacher-description" />
          <AppInput label="Carga Horária (horas)" keyboardType="numeric" value={props.cargaHoraria} onChangeText={props.setCargaHoraria} testID="teacher-carga-horaria" />
          <AppButton label="Publicar curso" onPress={props.onCreateCourse} loading={props.loading} testID="teacher-submit" />
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ gap: theme.spacing.s }}>
          <CourseCard course={item} onPress={() => props.onOpenCourse(item)} />
          <AppButton
            label="Excluir"
            variant="outline"
            style={{ marginHorizontal: theme.spacing.s, marginBottom: theme.spacing.s, borderColor: theme.colors.error }}
            onPress={() => Alert.alert("Excluir curso", `Deseja excluir "${item.title}"?`, [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: () => props.onDeleteCourse(item.course_id) },
            ])}
            testID={`delete-course-${item.course_id}`}
          />
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body, marginTop: theme.spacing.l }}>Você ainda não criou cursos.</Text>}
    />
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
