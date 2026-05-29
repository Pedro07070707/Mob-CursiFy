import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatMessage } from "../types";

const TEACHER_CHAT_KEY = "cursify_teacher_chat";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function privateKey(studentId: string, teacherId: string) {
  return `cursify_chat_${[studentId, teacherId].sort().join("_")}`;
}

export const chatService = {
  getTeacherMessages: async (): Promise<ChatMessage[]> => {
    const raw = await AsyncStorage.getItem(TEACHER_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  sendTeacherMessage: async (senderId: string, senderName: string, content: string): Promise<void> => {
    const msgs = await chatService.getTeacherMessages();
    msgs.push({ message_id: makeId(), sender_id: senderId, sender_name: senderName, content, created_at: new Date().toISOString() });
    await AsyncStorage.setItem(TEACHER_CHAT_KEY, JSON.stringify(msgs));
  },

  getPrivateMessages: async (studentId: string, teacherId: string): Promise<ChatMessage[]> => {
    const raw = await AsyncStorage.getItem(privateKey(studentId, teacherId));
    return raw ? JSON.parse(raw) : [];
  },

  sendPrivateMessage: async (studentId: string, teacherId: string, senderId: string, senderName: string, content: string): Promise<void> => {
    const key = privateKey(studentId, teacherId);
    const raw = await AsyncStorage.getItem(key);
    const msgs: ChatMessage[] = raw ? JSON.parse(raw) : [];
    msgs.push({ message_id: makeId(), sender_id: senderId, sender_name: senderName, content, created_at: new Date().toISOString() });
    await AsyncStorage.setItem(key, JSON.stringify(msgs));
  },

  getLastMessageTime: async (userA: string, userB: string): Promise<string | null> => {
    const raw = await AsyncStorage.getItem(privateKey(userA, userB));
    if (!raw) return null;
    const msgs: ChatMessage[] = JSON.parse(raw);
    return msgs.length > 0 ? msgs[msgs.length - 1].created_at : null;
  },

  getLastMessage: async (userA: string, userB: string): Promise<ChatMessage | null> => {
    const raw = await AsyncStorage.getItem(privateKey(userA, userB));
    if (!raw) return null;
    const msgs: ChatMessage[] = JSON.parse(raw);
    return msgs.length > 0 ? msgs[msgs.length - 1] : null;
  },
};
