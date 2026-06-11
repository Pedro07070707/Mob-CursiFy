import { useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import axios from "axios";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { CourseCard } from "../components/CourseCard";
import { CourseContentEditorSection } from "../components/CourseContentEditorSection";
import { CONTENT_TYPES, ContentEntry } from "../components/courseContentConfig";
import { useTheme } from "../contexts/ThemeContext";
import { Course, CreateCoursePayload } from "../types";
import { BASE_URL } from "../services/api";

const CATEGORIAS: Record<string, string> = {
  FUNDAMENTAL_1: "Fundamental 1 (1o ao 5o ano)",
  FUNDAMENTAL_2: "Fundamental 2 (6o ao 9o ano)",
  MEDIO_1: "Ensino Medio - 1o ano",
  MEDIO_2: "Ensino Medio - 2o ano",
  MEDIO_3: "Ensino Medio - 3o ano",
  OUTROS: "Outros",
};

type Sections = Record<string, ContentEntry[]>;

interface PublishCourseScreenProps {
  canManage: boolean;
  userId: number;
  courses: Course[];
  loading: boolean;
  onCreateCourse: (payload: CreateCoursePayload) => Promise<{ id: number; nome: string } | null>;
  onOpenCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function PublishCourseScreen({ canManage, userId, courses, loading, onCreateCourse, onOpenCourse, onDeleteCourse }: PublishCourseScreenProps) {
  const { theme } = useTheme();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("FUNDAMENTAL_1");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [sections, setSections] = useState<Sections>({
    material: [], exercicios: [], atividades: [], avaliacoes: [],
  });

  if (!canManage) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.l }]}>
        <Text style={{ fontSize: theme.typography.h2, color: theme.colors.textMain, fontWeight: "700" }}>Área de professor</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.s }}>Este perfil não tem permissão para criar cursos.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    const cargaNumerica = Number(cargaHoraria);
    if (!nome.trim() || !descricao.trim() || Number.isNaN(cargaNumerica) || cargaNumerica <= 0) {
      Alert.alert("Dados inválidos", "Preencha os dados obrigatórios do curso corretamente.");
      return;
    }
    if (!userId || Number.isNaN(userId)) {
      Alert.alert("Erro", "Nao foi possivel identificar o usuario logado. Entre novamente.");
      return;
    }

    const createdCourse = await onCreateCourse({
      title: nome.trim(),
      description: descricao.trim(),
      category: categoria,
      carga_horaria: cargaNumerica,
    });

    if (!createdCourse) return;

    const userRes = await axios.get(`${BASE_URL}/usuario/${userId}`);
    const relatedUser = userRes.data;

    for (const config of CONTENT_TYPES) {
      const validItems = sections[config.key].filter((item: any) => {
        if (config.key === "atividades" || config.key === "avaliacoes") {
          return item.enunciado.trim() && item.alternativa.trim();
        }
        return item.titulo.trim() && item.subtitulo.trim() && item.conteudo.trim();
      });
      await Promise.all(
        validItems.map((item, index) =>
          axios.post(`${BASE_URL}/${config.endpoint}`, config.buildPayload(item, createdCourse.id, userId, index, {
            user: relatedUser,
            course: createdCourse,
          }))
        )
      );
    }

    setNome(""); setDescricao(""); setCategoria("FUNDAMENTAL_1"); setCargaHoraria("");
    setSections({ material: [], exercicios: [], atividades: [], avaliacoes: [] });
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: theme.spacing.l, paddingBottom: theme.spacing.xxl }}
      data={courses}
      keyExtractor={(item) => item.course_id}
      ListHeaderComponent={
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surface, padding: theme.spacing.m, marginBottom: theme.spacing.l }}>
          <Text style={{ fontSize: theme.typography.h2, fontWeight: "700", color: theme.colors.textMain, marginBottom: theme.spacing.s }}>Publicar Novo Curso</Text>

          <AppInput label="Nome do Curso" placeholder="Ex: Matematica Basica" value={nome} onChangeText={setNome} testID="publish-nome" />
          <AppInput label="Descricao" placeholder="Descreva o conteudo e os objetivos do curso..." value={descricao} onChangeText={setDescricao} multiline testID="publish-descricao" />

          <Text style={{ fontWeight: "600", color: theme.colors.textMain, fontSize: theme.typography.small, marginBottom: theme.spacing.s }}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.s }}>
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              {Object.entries(CATEGORIAS).map(([key, label]) => (
                <AppButton key={key} label={label} variant={categoria === key ? "primary" : "outline"} onPress={() => setCategoria(key)} style={{ minWidth: 160 }} testID={`publish-cat-${key}`} />
              ))}
            </View>
          </ScrollView>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.small, marginBottom: theme.spacing.m }}>
            Selecionado: <Text style={{ fontWeight: "700", color: theme.colors.textMain }}>{CATEGORIAS[categoria]}</Text>
          </Text>

          <AppInput label="Carga Horaria (em horas)" placeholder="Ex: 40" keyboardType="numeric" value={cargaHoraria} onChangeText={setCargaHoraria} testID="publish-carga" />

          {CONTENT_TYPES.map((config) => (
            <CourseContentEditorSection
              key={config.key}
              config={config}
              items={sections[config.key]}
              onChange={(items) => setSections((prev) => ({ ...prev, [config.key]: items }))}
            />
          ))}

          <View style={{ marginTop: theme.spacing.m, padding: theme.spacing.m, backgroundColor: "#f0f8ff", borderRadius: theme.radius.md, marginBottom: theme.spacing.m }}>
            <Text style={{ fontWeight: "700", color: theme.colors.textMain }}>Status inicial</Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 4 }}>O curso sera publicado com o status "Em progresso".</Text>
          </View>

          <AppButton label="Publicar Curso" onPress={handleSubmit} loading={loading} testID="publish-submit" />
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ marginBottom: theme.spacing.m }}>
          <CourseCard course={item} onPress={() => onOpenCourse(item)} />
          <AppButton
            label="Excluir"
            variant="outline"
            style={{ borderColor: theme.colors.error, marginTop: theme.spacing.s }}
            onPress={() => Alert.alert("Excluir curso", `Deseja excluir "${item.title}"?`, [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", style: "destructive", onPress: () => onDeleteCourse(item.course_id) },
            ])}
            testID={`delete-course-${item.course_id}`}
          />
        </View>
      )}
      ListEmptyComponent={<Text style={{ color: theme.colors.textMuted, fontSize: theme.typography.body }}>Você ainda não criou cursos.</Text>}
    />
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
