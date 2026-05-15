"use client";

import { create } from "zustand";

export type AssistantNotificationType = "success" | "error" | "warning" | "info";

export type AssistantNotification = {
  id: string;
  type: AssistantNotificationType;
  title: string;
  message: string;
  actionText?: string;
  duration?: number;
  returnText?: string;
  voiceText?: string;
  voiceType?: "login" | "logout" | "default";
};

type AssistantNotificationInput = Omit<AssistantNotification, "id"> & {
  id?: string;
};

type AssistantNotificationState = {
  current: AssistantNotification | null;
  queue: AssistantNotification[];
  notify: (notification: AssistantNotificationInput) => void;
  dismiss: () => void;
  clear: () => void;
};

function createNotification(notification: AssistantNotificationInput): AssistantNotification {
  return {
    actionText: "我知道了",
    returnText: "任务提醒完成，我继续待命～",
    ...notification,
    id: notification.id ?? `assistant-notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export const useAssistantNotificationStore = create<AssistantNotificationState>((set) => ({
  current: null,
  queue: [],
  notify: (notification) => {
    const nextNotification = createNotification(notification);
    set((state) => {
      if (!state.current) {
        return { current: nextNotification };
      }

      return { queue: [...state.queue, nextNotification] };
    });
  },
  dismiss: () => {
    set((state) => {
      const [nextNotification, ...nextQueue] = state.queue;
      return {
        current: nextNotification ?? null,
        queue: nextQueue,
      };
    });
  },
  clear: () => set({ current: null, queue: [] }),
}));

export function showDreamAssistantNotification(notification: AssistantNotificationInput) {
  useAssistantNotificationStore.getState().notify(notification);
}
