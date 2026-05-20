import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { AppTab } from "../types";

interface TabItem {
  key: AppTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export function BottomTabBar({ tabs, activeTab, onChange }: BottomTabBarProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.m,
        },
      ]}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            testID={`tab-${tab.key}`}
            accessibilityRole="button"
            accessibilityLabel={`Abrir aba ${tab.label}`}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.item,
              active && { backgroundColor: theme.colors.activeTabBg },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={tab.icon} size={20} color={active ? theme.colors.primary : theme.colors.textMuted} />
            <Text style={[styles.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  item: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  pressed: { transform: [{ scale: 0.96 }] },
  label: { fontSize: 11, fontWeight: "600" },
});
