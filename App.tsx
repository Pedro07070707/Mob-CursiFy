import { Component, ReactNode } from "react";
import { Text, View } from "react-native";
import Index from "./frontend/app/index";

type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#ffffff" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111827" }}>
            Erro ao abrir o CursiFy
          </Text>
          <Text style={{ color: "#374151", lineHeight: 22 }}>{this.state.error.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Index />
    </ErrorBoundary>
  );
}
