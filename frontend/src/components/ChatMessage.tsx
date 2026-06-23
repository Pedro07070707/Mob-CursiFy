import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatMessage as ChatMessageType } from "../types";
import { useTheme } from "../contexts/ThemeContext";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      <View style={[styles.bubble, { backgroundColor: isOwnMessage ? theme.colors.primary : theme.colors.surface }]}>
        {!isOwnMessage && <Text style={[styles.sender, { color: theme.colors.primary }]}>{message.sender_name}</Text>}
        <Text style={[styles.content, { color: isOwnMessage ? "#fff" : theme.colors.textMain }]}>{message.content}</Text>
        <Text style={[styles.time, { color: isOwnMessage ? "#fff9" : theme.colors.textMuted }]}>
          {new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: "flex-start",
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  sender: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
  },
});
