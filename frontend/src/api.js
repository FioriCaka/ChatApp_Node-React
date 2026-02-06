const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const request = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = "Request failed";
    let field = null;
    try {
      const data = await res.json();
      message = data.message || message;
      field = data.field || null;
    } catch {
      message = "Request failed";
    }
    const error = new Error(message);
    error.status = res.status;
    error.field = field;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
};

export const authApi = {
  signup: (payload) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/check"),
  updateProfile: (payload) =>
    request("/api/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const messagesApi = {
  contacts: () => request("/api/messages/contacts"),
  online: () => request("/api/messages/online"),
  chats: () => request("/api/messages/chats"),
  messages: (userId) => request(`/api/messages/${userId}`),
  send: (userId, payload) =>
    request(`/api/messages/send/${userId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  edit: (messageId, payload) =>
    request(`/api/messages/message/${messageId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (messageId, scope = "me") =>
    request(`/api/messages/message/${messageId}?scope=${scope}`, {
      method: "DELETE",
    }),
};
