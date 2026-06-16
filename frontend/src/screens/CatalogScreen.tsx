import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { CourseCard } from "../components/CourseCard";
import { useTheme } from "../contexts/ThemeContext";
import courseService from "../services/courseService";
import { Course } from "../types";

interface CatalogScreenProps {
  courses: Course[];
  loading: boolean;
  userId: string;
  onOpenCourse: (course: Course) => void;
  onRefresh: () => void;
}

export function CatalogScreen({ courses, loading, userId, onOpenCourse, onRefresh }: CatalogScreenProps) {
  const { theme } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({});

  useEffect(() => {
    courseService.getFavorites(userId).then(setFavorites);
    Promise.all(courses.map((c) => courseService.getRating(userId, c.course_id))).then((results) => {
      const map: Record<string, { average: number; count: number }> = {};
      courses.forEach((c, i) => { map[c.course_id] = { average: results[i].average, count: results[i].count }; });
      setRatings(map);
    });
  }, [userId, courses]);

  const handleToggleFavorite = async (courseId: string) => {
    await courseService.toggleFavorite(userId, courseId);
    setFavorites((prev) => prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.l, paddingTop: theme.spacing.l, paddingBottom: theme.spacing.xxl }}
    >
      <Text style={{ fontSize: theme.typography.h2, fontWeight: "700", color: theme.colors.textMain }}>Catálogo de cursos</Text>
      <Text style={{ marginTop: theme.spacing.s, marginBottom: theme.spacing.l, fontSize: theme.typography.body, color: theme.colors.textMuted }}>
        Escolha um curso e veja todos os detalhes antes da inscrição.
      </Text>

      {courses.length === 0 ? (
        <Text style={{ color: theme.colors.textMuted, marginTop: theme.spacing.xl, fontSize: theme.typography.body }}>
          Ainda não há cursos cadastrados.
        </Text>
      ) : (
        courses.map((item) => (
          <CourseCard
            key={item.course_id}
            course={item}
            onPress={() => onOpenCourse(item)}
            isFavorite={favorites.includes(item.course_id)}
            onToggleFavorite={() => handleToggleFavorite(item.course_id)}
            rating={ratings[item.course_id]?.average ?? 0}
            ratingCount={ratings[item.course_id]?.count ?? 0}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
