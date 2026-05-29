import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { chatService } from "../services/chatService";
import { ChatMessage as ChatMessageType, User } from "../types";
import { getAuthToken } from "../services/api";
import authService from "../services/authService";

interface Props {
  userName: string;
}

type Tab = "students" | "teachers";

interface UserWithPreview extends User {
  lastMsg?: ChatMessage | null;
}

export default function TeacherChatScreen({ userName }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;
  const userId = getAuthToken() || "";

  const [tab, setTab] = useState<Tab>("students");
  const [view, setView] = useState<"list" | "chat">("list");
  const [students, setStudents] = useState<UserWithPreview[]>([]);
  const [teachers, setTeachers] = useState<UserWithPreview[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithPreview | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    authService.getAll().then(async (users) => {
      const studs = users.filter((u) => u.role === "student");
      const tchs = users.filter((u) => u.role === "teacher" && u.user_id !== userId);
      const withPreview = async (list: User[]): Promise<UserWithPreview[]> => {
        const previews = await Promise.all(list.map((u) => chatService.getLastMessage(userId, u.user_id)));
        return list
          .map((u, i) => ({ ...u, lastMsg: previews[i] }))
          .sort((a, b) => (b.lastMsg?.created_at ?? "") > (a.lastMsg?.created_at ?? "") ? 1 : -1);
      };
      setStudents(await withPreview(studs));
      setTeachers(await withPreview(tchs));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const openChat = async (user: User) => {
    setSelectedUser(user);
    setView("chat");
    const msgs = tab === "teachers"
      ? await chatService.getTeacherMessages()
      : await chatService.getPrivateMessages(userId, user.user_id);
    setMessages(msgs);
    intervalRef.current = setInterval(async () => {
      const updated = tab === "teachers"
        ? await chatService.getTeacherMessages()
        : await chatService.getPrivateMessages(userId, user.user_id);
      setMessages(updated);
    }, 3000);
  };

  const closeChat = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setView("list");
    setSelectedUser(null);
    setMessages([]);
  };

  const send = async () => {
    if (!text.trim() || !selectedUser) return;
    if (tab === "teachers") {
      await chatService.sendTeacherMessage(userId, userName, text.trim());
      setMessages(await chatService.getTeacherMessages());
    } else {
      await chatService.sendPrivateMessage(userId, selectedUser.user_id, userId, userName, text.trim());
      const msgs = await chatService.getPrivateMessages(userId, selectedUser.user_id);
      setMessages(msgs);
      const lastMsg = msgs[msgs.length - 1];
      setStudents((prev) => [{ ...selectedUser, lastMsg }, ...prev.filter((u) => u.user_id !== selectedUser.user_id)]);
    }
    setText("");
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const list = (tab === "students" ? students : teachers).filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "chat") {
    return (
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: c.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { backgroundColor: "#0EA5E9" }]}>
          <TouchableOpacity onPress={closeChat}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedUser?.username}</Text>
          <Text style={styles.headerSub}>{tab === "students" ? "Aluno" : "Professor"}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.message_id}
          contentContainerStyle={{ padding: 12, flexGrow: 1 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={<Text style={[styles.empty, { color: c.textMuted }]}>Nenhuma mensagem ainda. Inicie a conversa!</Text>}
          renderItem={({ item }) => {
            const own = item.sender_id === userId;
            return (
              <View style={[styles.row, own && styles.rowOwn]}>
                <View style={[styles.bubble, { backgroundColor: own ? c.primary : c.surface }]}>
                  {!own && tab === "teachers" && <Text style={[styles.sender, { color: c.primary }]}>{item.sender_name}</Text>}
                  <Text style={[styles.msgText, { color: own ? "#fff" : c.textMain }]}>{item.content}</Text>
                  <Text style={[styles.time, { color: own ? "#ffffffaa" : c.textMuted }]}>
                    {new Date(item.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.inputRow, { backgroundColor: c.surface, borderTopColor: c.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, color: c.textMain, borderColor: c.border }]}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: c.primary, opacity: text.trim() ? 1 : 0.4 }]} onPress={send} disabled={!text.trim()}>
            <Text style={styles.sendBtnText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: "#0EA5E9" }]}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <View style={[styles.tabs, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={[styles.tabBtn, tab === "students" && { borderBottomColor: c.primary, borderBottomWidth: 2 }]} onPress={() => { setTab("students"); setSearch(""); }}>
          <Text style={[styles.tabText, { color: tab === "students" ? c.primary : c.textMuted }]}>Alunos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === "teachers" && { borderBottomColor: c.primary, borderBottomWidth: 2 }]} onPress={() => { setTab("teachers"); setSearch(""); }}>
          <Text style={[styles.tabText, { color: tab === "teachers" ? c.primary : c.textMuted }]}>Professores</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBox, { borderColor: c.border }]}>
        <TextInput
          style={[styles.searchInput, { color: c.textMain }]}
          placeholder={`Pesquisar ${tab === "students" ? "aluno" : "professor"}...`}
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={c.primary} />
      ) : list.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>
          {search ? "Nenhum resultado encontrado." : `Nenhum ${tab === "students" ? "aluno" : "professor"} disponível.`}
        </Text>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.user_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userItem, { backgroundColor: c.surface, borderBottomColor: c.border }]}
              onPress={() => openChat(item)}
            >
              <View style={[styles.avatar, { backgroundColor: c.primary }]}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userRow}>
                  <Text style={[styles.userName, { color: c.textMain }]}>{item.username}</Text>
                  {item.lastMsg && (
                    <Text style={[styles.previewTime, { color: c.textMuted }]}>
                      {new Date(item.lastMsg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  )}
                </View>
                <Text style={[styles.previewText, { color: c.textMuted }]} numberOfLines={1}>
                  {item.lastMsg
                    ? (item.lastMsg.sender_id === userId ? "Você: " : "") + item.lastMsg.content
                    : tab === "students" ? "Aluno" : "Professor"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 20 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  headerSub: { fontSize: 12, color: "#ffffffaa", marginTop: 2 },
  backText: { color: "#ffffffcc", fontSize: 14, marginBottom: 4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 15, fontWeight: "600" },
  searchBox: { margin: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "transparent" },
  searchInput: { fontSize: 15 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14 },
  userItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  userInfo: { flex: 1 },
  userRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 16, fontWeight: "600" },
  userRole: { fontSize: 13, marginTop: 2 },
  previewText: { fontSize: 13, marginTop: 2 },
  previewTime: { fontSize: 12 },
  row: { marginVertical: 4, alignItems: "flex-start" },
  rowOwn: { alignItems: "flex-end" },
  bubble: { maxWidth: "75%", padding: 12, borderRadius: 16 },
  sender: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  msgText: { fontSize: 15 },
  time: { fontSize: 11, marginTop: 4 },
  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, alignItems: "flex-end" },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100, marginRight: 8 },
  sendBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  sendBtnText: { color: "#fff", fontWeight: "600" },
});
