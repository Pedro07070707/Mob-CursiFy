import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CourseCard } from "../components/CourseCard";
import { useTheme } from "../contexts/ThemeContext";
import { Enrollment } from "../types";
import { useState } from "react";

interface MyCoursesScreenProps {
  enrollments: Enrollment[];
  onOpenCourse: (courseId: string) => void;
}

export function MyCoursesScreen({ enrollments, onOpenCourse }: MyCoursesScreenProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l }]}>
      <Text style={{ fontSize: theme.typography.h2, fontWeight: "700", color: theme.colors.textMain }}>Meus cursos</Text>
      <Text style={{ marginTop: theme.spacing.s, marginBottom: theme.spacing.l, fontSize: theme.typography.body, color: theme.colors.textMuted }}>
        Acesse rapidamente os cursos onde você já está inscrito.
      </Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.enrollment_id}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        ListEmptyComponent={<Text style={{ marginTop: theme.spacing.xl, color: theme.colors.textMuted, fontSize: theme.typography.body }}>Você ainda não possui inscrições ativas.</Text>}
        renderItem={({ item }) => {
          const isOpen = expanded === item.enrollment_id;
          const hasLinks = (item.course.video_links?.length > 0) || (item.course.site_links?.length > 0);
          return (
            <View style={{ marginBottom: theme.spacing.s }}>
              <CourseCard course={item.course} onPress={() => onOpenCourse(item.course.course_id)} />
              {hasLinks && (
                <TouchableOpacity
                  onPress={() => setExpanded(isOpen ? null : item.enrollment_id)}
                  style={{ paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s, backgroundColor: theme.colors.surface, borderWidth: 1, borderTopWidth: 0, borderColor: theme.colors.border, borderBottomLeftRadius: theme.radius.md, borderBottomRightRadius: theme.radius.md }}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: "600", fontSize: theme.typography.small }}>
                    {isOpen ? "▲ Ocultar links de estudo" : "▼ Ver links de estudo"}
                  </Text>
                </TouchableOpacity>
              )}
              {isOpen && (
                <View style={{ backgroundColor: theme.colors.surface, borderWidth: 1, borderTopWidth: 0, borderColor: theme.colors.border, borderBottomLeftRadius: theme.radius.md, borderBottomRightRadius: theme.radius.md, padding: theme.spacing.m }}>
                  {item.course.video_links?.length > 0 && (
                    <View style={{ marginBottom: theme.spacing.s }}>
                      <Text style={{ fontWeight: "700", color: theme.colors.textMain, marginBottom: theme.spacing.xs, fontSize: theme.typography.small }}>🎬 Vídeos de aula</Text>
                      {item.course.video_links.map((link, i) => (
                        <TouchableOpacity key={i} onPress={() => Linking.openURL(link)}>
                          <Text style={{ color: theme.colors.primary, fontSize: theme.typography.small, textDecorationLine: "underline", marginBottom: 4 }} numberOfLines={1}>{link}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {item.course.site_links?.length > 0 && (
                    <View>
                      <Text style={{ fontWeight: "700", color: theme.colors.textMain, marginBottom: theme.spacing.xs, fontSize: theme.typography.small }}>🌐 Sites de estudo</Text>
                      {item.course.site_links.map((link, i) => (
                        <TouchableOpacity key={i} onPress={() => Linking.openURL(link)}>
                          <Text style={{ color: theme.colors.primary, fontSize: theme.typography.small, textDecorationLine: "underline", marginBottom: 4 }} numberOfLines={1}>{link}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
