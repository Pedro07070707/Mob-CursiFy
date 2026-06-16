import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { pickCourseImage } from "../constants/images";
import { useTheme } from "../contexts/ThemeContext";
import { Course } from "../types";

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  rating?: number;
  ratingCount?: number;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons key={s} name={s <= Math.round(rating) ? "star" : "star-outline"} size={size} color="#F59E0B" />
      ))}
    </View>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function CourseCard({ course, onPress, isFavorite, onToggleFavorite, rating = 0, ratingCount = 0 }: CourseCardProps) {
  const { theme } = useTheme();
  const imageUri = course.thumbnail_base64 || pickCourseImage(course.category, course.title);
  const updatedAt = formatDate(course.created_at);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir curso ${course.title}`}
      testID={`course-card-${course.course_id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderColor: theme.colors.border, backgroundColor: theme.colors.background, borderRadius: theme.radius.lg, marginBottom: theme.spacing.m },
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: imageUri }} style={[styles.banner, { backgroundColor: theme.colors.surfaceHighlight }]} />
      {onToggleFavorite && (
        <Pressable onPress={onToggleFavorite} style={styles.favBtn} hitSlop={8}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#EF4444" : "#fff"} />
        </Pressable>
      )}
      <View style={[styles.content, { gap: theme.spacing.s, padding: theme.spacing.m }]}>
        <Text style={[styles.category, { color: theme.colors.primary, fontSize: theme.typography.small }]}>{course.category}</Text>
        <Text style={[styles.title, { color: theme.colors.textMain }]}>{course.title}</Text>
        <Text style={[styles.meta, { color: theme.colors.textMuted, fontSize: theme.typography.small }]}>{course.teacher_name}</Text>
        <Text style={[styles.meta, { color: theme.colors.textMuted, fontSize: theme.typography.small }]}>
          {course.carga_horaria}h • {course.enrolled_count} inscritos
        </Text>
        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <StarRow rating={rating} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginLeft: 4 }}>
              {rating > 0 ? `${rating.toFixed(1)} (${ratingCount})` : "Sem avaliações"}
            </Text>
          </View>
          {updatedAt && (
            <Text style={{ color: theme.colors.textMuted, fontSize: 11 }}>Atualizado: {updatedAt}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden", borderWidth: 1 },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.95 },
  banner: { width: "100%", height: 130 },
  favBtn: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 20, padding: 6 },
  content: {},
  category: { fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "700" },
  meta: {},
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  stars: { flexDirection: "row" },
});
