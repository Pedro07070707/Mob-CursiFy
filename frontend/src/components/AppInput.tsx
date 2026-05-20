import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

interface AppInputProps extends TextInputProps {
  label: string;
}

export function AppInput({ label, ...props }: AppInputProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.typography.small }]}>{label}</Text>
      <TextInput
        {...props}
        testID={props.testID}
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            fontSize: theme.typography.body,
            color: theme.colors.textMain,
          },
          props.style,
        ]}
        placeholderTextColor={theme.colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { marginBottom: 8, fontWeight: "500" },
  input: { minHeight: 48, borderWidth: 1, paddingHorizontal: 16 },
});
