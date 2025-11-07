import { create } from "zustand";
import api from "../api/axios";
import socket from "../utils/socket";

export const useStore = create((set, get) => ({
  user: null,
  token: null,
  events: [],
  swappableSlots: [],
  incomingRequests: [],
  outgoingRequests: [],
  setState: (data) => set(data),

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    set({ user: res.data.user, token: res.data.token });
    socket.connect();
    socket.emit("register", res.data.user.id);
  },

  logout: () => {
    localStorage.removeItem("token");
    socket.disconnect();
    set({ user: null, token: null });
  },

  fetchEvents: async () => {
   try {
  const res = await api.get("/events/mine");
  set({ events: res.data });
} catch (err) {
  console.error("Failed to fetch events:", err.response?.status);
}
  },

  fetchSwappableSlots: async () => {
     try {
      const res = await api.get("/swappable-slots"); 
      set({ swappableSlots: res.data });
    } catch (err) {
      console.error("Failed to fetch swappable slots", err);
    }
  },

  fetchIncoming: async () => {
  try {
    const res = await api.get("/requests/incoming");
    set({ incomingRequests: res.data });
  } catch (err) {
    console.error("Failed to fetch incoming requests", err);
  }
},

fetchOutgoing: async () => {
  try {
    const res = await api.get("/requests/outgoing");
    set({ outgoingRequests: res.data });
  } catch (err) {
    console.error("Failed to fetch outgoing requests", err);
  }
},

}));
