// ---- Types ----
export interface IChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type ChatMessage = IChatMessage & {
  id: string;
};
