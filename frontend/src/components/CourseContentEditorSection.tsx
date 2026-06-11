import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { AppInput } from "./AppInput";
import { useTheme } from "../contexts/ThemeContext";
import { ContentEntry, ContentTypeConfig, createEmptyEntry } from "./courseContentConfig";

const LABELS: Record<string, string> = {
  material: "Material",
  exercicios: "Exercicio",
  atividades: "Atividade",
  avaliacoes: "Avaliacao",
};

interface Props {
  config: ContentTypeConfig;
  items: ContentEntry[];
  onChange: (items: ContentEntry[]) => void;
}

export function CourseContentEditorSection({ config, items, onChange }: Props) {
  const { theme } = useTheme();
  const isQA = config.key === "atividades" || config.key === "avaliacoes";
  const label = LABELS[config.key] || config.title;

  const handleAdd = () => onChange([...items, createEmptyEntry(config.key)]);
  const handleRemove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const handleChange = (i: number, field: string, value: string) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  return (
    <View style={{ marginTop: 24 }}>
      <View style={styles.sectionHeader}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: theme.colors.textMain }}>{config.title}</Text>
        <AppButton label="Adicionar" variant="secondary" onPress={handleAdd} style={{ minWidth: 100 }} testID={`add-${config.key}`} />
      </View>

      {items.length === 0 && (
        <View style={[styles.emptyCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.textMuted }}>Nenhum item adicionado nesta secao.</Text>
        </View>
      )}

      {items.map((item: any, index) => (
        <View key={`${config.key}-${index}`} style={[styles.itemCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <View style={styles.itemHeader}>
            <Text style={{ fontWeight: "700", color: theme.colors.textMain }}>{label} {index + 1}</Text>
            <AppButton
              label="Remover"
              variant="outline"
              style={{ borderColor: theme.colors.error, minWidth: 90 }}
              onPress={() => handleRemove(index)}
              testID={`remove-${config.key}-${index}`}
            />
          </View>

          {isQA ? (
            <>
              <AppInput label="Enunciado" placeholder="Digite o enunciado..." value={item.enunciado} onChangeText={(v) => handleChange(index, "enunciado", v)} multiline testID={`${config.key}-enunciado-${index}`} />
              <AppInput label="Alternativa / Resposta" placeholder="Digite a alternativa correta ou resposta" value={item.alternativa} onChangeText={(v) => handleChange(index, "alternativa", v)} testID={`${config.key}-alternativa-${index}`} />
              <AppInput label="Status (%)" placeholder="0" keyboardType="numeric" value={String(item.status)} onChangeText={(v) => handleChange(index, "status", v)} testID={`${config.key}-status-${index}`} />
            </>
          ) : (
            <>
              <AppInput label="Titulo" placeholder="Ex: Introducao" value={item.titulo} onChangeText={(v) => handleChange(index, "titulo", v)} testID={`${config.key}-titulo-${index}`} />
              <AppInput label="Subtitulo" placeholder="Ex: Conceitos iniciais" value={item.subtitulo} onChangeText={(v) => handleChange(index, "subtitulo", v)} testID={`${config.key}-subtitulo-${index}`} />
              <AppInput label="Conteudo" placeholder="Descreva o conteudo..." value={item.conteudo} onChangeText={(v) => handleChange(index, "conteudo", v)} multiline testID={`${config.key}-conteudo-${index}`} />
              <AppInput label="Link" placeholder="https://..." value={item.link} onChangeText={(v) => handleChange(index, "link", v)} keyboardType="url" autoCapitalize="none" testID={`${config.key}-link-${index}`} />
              <Text style={{ fontWeight: "600", color: theme.colors.textMain, fontSize: 13, marginBottom: 8 }}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["Nao concluido", "Concluido"].map((opt) => (
                    <AppButton key={opt} label={opt} variant={item.status === opt ? "primary" : "outline"} onPress={() => handleChange(index, "status", opt)} style={{ minWidth: 120 }} testID={`${config.key}-status-${opt}-${index}`} />
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  emptyCard: { padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
  itemCard: { padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 12 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
});
