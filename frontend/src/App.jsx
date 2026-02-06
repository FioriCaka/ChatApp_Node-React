import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { authApi, messagesApi } from "./api";
import "./App.css";

const emptyForm = { fullName: "", email: "", password: "" };
const emptyProfile = { fullName: "", profilePicture: "" };
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDay = (value) =>
  new Date(value).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyForm);
  const [authError, setAuthError] = useState("");

  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState("chats");
  const [search, setSearch] = useState("");
  const [onlineIds, setOnlineIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);

  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const contactsRef = useRef([]);

  const activeContactId = activeContact?._id;

  const avatar = useMemo(() => {
    if (!user?.fullName) return "?";
    return user.fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const contactInitials = (contact) => {
    if (!contact?.fullName) return "?";
    return contact.fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (contact) =>
        contact.fullName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query),
    );
  }, [contacts, search]);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;
    return chats.filter(
      (chat) =>
        chat.user?.fullName?.toLowerCase().includes(query) ||
        chat.user?.email?.toLowerCase().includes(query),
    );
  }, [chats, search]);

  const handleAuthError = (error) => {
    if (error?.status === 401) {
      setUser(null);
    }
    setStatus(error?.message || "Request failed");
  };

  const loadContacts = async () => {
    const data = await messagesApi.contacts();
    setContacts(data);
  };

  const loadChats = async () => {
    const data = await messagesApi.chats();
    setChats(data);
  };

  const loadMessages = async (contactId) => {
    if (!contactId) return;
    const data = await messagesApi.messages(contactId);
    setMessages(data);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authApi.me();
        setUser(me);
        setProfileForm({
          fullName: me.fullName || "",
          profilePicture: me.profilePicture || "",
        });
        await Promise.all([loadContacts(), loadChats()]);
      } catch {
        setUser(null);
      }
    };
    init();
  }, []);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    if (!user) return;
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("presence:update", (ids) => {
      setOnlineIds(ids || []);
      setContacts((prev) =>
        prev.map((contact) => ({
          ...contact,
          online: ids.includes(String(contact._id)),
        })),
      );
      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          user: chat.user
            ? {
                ...chat.user,
                online: ids.includes(String(chat.user._id)),
              }
            : chat.user,
        })),
      );
    });

    socket.on("message:new", (payload) => {
      const senderId = String(payload.senderId);
      if (activeContactId && senderId === String(activeContactId)) {
        setMessages((prev) => [...prev, payload]);
        scrollToBottom();
      } else {
        const sender = contactsRef.current.find(
          (contact) => String(contact._id) === senderId,
        );
        const title = `New message from ${sender?.fullName || "Unknown"}`;
        setNotifications((prev) => {
          const next = [{ id: Date.now(), title, text: payload.text }, ...prev];
          return next.slice(0, 3);
        });
      }
      loadChats();
    });

    socket.on("message:edit", (payload) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === payload._id ? payload : msg)),
      );
      loadChats();
    });

    socket.on("message:delete", ({ messageId, scope }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      if (scope === "all") {
        loadChats();
      }
    });

    socket.on("message:read", ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, readAt: new Date().toISOString() }
            : msg,
        ),
      );
      loadChats();
    });

    socket.on("typing", ({ from, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [from]: isTyping,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeContactId]);

  useEffect(() => {
    if (!activeContactId) return;
    loadMessages(activeContactId).then(scrollToBottom);
    const interval = setInterval(() => loadMessages(activeContactId), 5000);
    return () => clearInterval(interval);
  }, [activeContactId]);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timeout = setTimeout(() => {
      setNotifications((prev) => prev.slice(0, -1));
    }, 5000);
    return () => clearTimeout(timeout);
  }, [notifications]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const payload = {
        email: authForm.email,
        password: authForm.password,
        ...(authMode === "signup" ? { fullName: authForm.fullName } : {}),
      };

      const data =
        authMode === "signup"
          ? await authApi.signup(payload)
          : await authApi.login(payload);

      setUser(data);
      setProfileForm({
        fullName: data.fullName || "",
        profilePicture: data.profilePicture || "",
      });
      setAuthForm(emptyForm);
      await Promise.all([loadContacts(), loadChats()]);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
    setContacts([]);
    setChats([]);
    setMessages([]);
    setActiveContact(null);
  };

  const selectContact = (contact) => {
    setActiveContact(contact);
    setTab("chats");
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!activeContactId || (!messageText.trim() && !attachment)) return;
    setStatus("");
    try {
      await messagesApi.send(activeContactId, {
        message: messageText.trim(),
        image: attachment?.image || "",
        fileName: attachment?.fileName || "",
        fileType: attachment?.fileType || "",
      });
      setMessageText("");
      setAttachment(null);
      await Promise.all([loadMessages(activeContactId), loadChats()]);
      scrollToBottom();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleTyping = (value) => {
    setMessageText(value);
    if (!socketRef.current || !activeContactId) return;
    socketRef.current.emit("typing", { to: activeContactId, isTyping: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current.emit("typing", {
        to: activeContactId,
        isTyping: false,
      });
    }, 1200);
  };

  const handleAttachment = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        image: reader.result,
        fileName: file.name,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEditMessage = async (messageId) => {
    if (!editingText.trim()) return;
    try {
      const updated = await messagesApi.edit(messageId, { text: editingText });
      setMessages((prev) =>
        prev.map((msg) => (msg._id === updated._id ? updated : msg)),
      );
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleDeleteMessage = async (messageId, scope) => {
    try {
      await messagesApi.remove(messageId, scope);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const updated = await authApi.updateProfile(profileForm);
      setUser(updated);
      setProfileOpen(false);
    } catch (error) {
      handleAuthError(error);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="brand">
            <div className="brand-icon">LC</div>
            <div>
              <h1>Local Chat</h1>
              <p className="muted">Sign in to start chatting locally.</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "signup" && (
              <label>
                Full name
                <input
                  value={authForm.fullName}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, fullName: event.target.value })
                  }
                  placeholder="Jane Doe"
                  required
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                placeholder="••••••••"
                required
              />
            </label>
            {authError && <div className="error">{authError}</div>}
            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : authMode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
          <button
            type="button"
            className="ghost"
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
          >
            {authMode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="user-card">
          <div className="avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt={user.fullName} />
            ) : (
              avatar
            )}
          </div>
          <div className="user-meta">
            <p className="user-name">{user.fullName}</p>
            <p className="muted">{user.email}</p>
          </div>
          <div className="user-actions">
            <button className="ghost" onClick={() => setProfileOpen(true)}>
              Edit
            </button>
            <button className="ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people or chats"
          />
        </div>

        <div className="tabs">
          <button
            type="button"
            className={tab === "chats" ? "active" : ""}
            onClick={() => setTab("chats")}
          >
            Chats
          </button>
          <button
            type="button"
            className={tab === "contacts" ? "active" : ""}
            onClick={() => setTab("contacts")}
          >
            Contacts
          </button>
        </div>

        {tab === "chats" && (
          <div className="list">
            {filteredChats.length === 0 && (
              <p className="muted">No chats yet. Start a conversation.</p>
            )}
            {filteredChats.map((chat) => (
              <button
                key={chat.user?._id}
                type="button"
                className={`list-item ${
                  activeContactId === chat.user?._id ? "active" : ""
                }`}
                onClick={() => selectContact(chat.user)}
              >
                <div className="list-item-avatar">
                  {chat.user?.profilePicture ? (
                    <img
                      src={chat.user.profilePicture}
                      alt={chat.user.fullName}
                    />
                  ) : (
                    contactInitials(chat.user)
                  )}
                </div>
                <div className="list-item-title">
                  {chat.user?.fullName}
                  {chat.user?.online && <span className="online-dot" />}
                </div>
                <div className="muted small">
                  {chat.lastMessage?.text || "No messages yet"}
                </div>
                {chat.unreadCount > 0 && (
                  <span className="badge">{chat.unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {tab === "contacts" && (
          <div className="list">
            {filteredContacts.length === 0 && (
              <p className="muted">No contacts yet. Create another user.</p>
            )}
            {filteredContacts.map((contact) => (
              <button
                key={contact._id}
                type="button"
                className={`list-item ${
                  activeContactId === contact._id ? "active" : ""
                }`}
                onClick={() => selectContact(contact)}
              >
                <div className="list-item-avatar">
                  {contact.profilePicture ? (
                    <img src={contact.profilePicture} alt={contact.fullName} />
                  ) : (
                    contactInitials(contact)
                  )}
                </div>
                <div className="list-item-title">
                  {contact.fullName}
                  {onlineIds.includes(String(contact._id)) && (
                    <span className="online-dot" />
                  )}
                </div>
                <div className="muted small">{contact.email}</div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="chat-panel">
        {!activeContact && (
          <div className="empty-state">
            <h2>Welcome back, {user.fullName.split(" ")[0]}</h2>
            <p className="muted">Pick a contact or chat to start messaging.</p>
          </div>
        )}

        {activeContact && (
          <div className="chat-container">
            <header>
              <div>
                <div className="chat-header">
                  <div className="avatar small">
                    {activeContact.profilePicture ? (
                      <img
                        src={activeContact.profilePicture}
                        alt={activeContact.fullName}
                      />
                    ) : (
                      contactInitials(activeContact)
                    )}
                  </div>
                  <div>
                    <h2>{activeContact.fullName}</h2>
                    <p className="muted">
                      {activeContact.email} ·{" "}
                      {typingUsers[activeContactId]
                        ? "Typing..."
                        : onlineIds.includes(String(activeContactId))
                          ? "Online"
                          : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="ghost"
                type="button"
                onClick={() => setActiveContact(null)}
              >
                Close
              </button>
            </header>

            <div className="messages">
              {messages.length === 0 && (
                <p className="muted">No messages yet. Say hello 👋</p>
              )}
              {messages.map((msg, index) => {
                const showDay =
                  index === 0 ||
                  formatDay(messages[index - 1].createdAt) !==
                    formatDay(msg.createdAt);
                const isOwn = msg.senderId === user._id;
                return (
                  <div key={msg._id}>
                    {showDay && (
                      <div className="day-separator">
                        {formatDay(msg.createdAt)}
                      </div>
                    )}
                    <div
                      className={`message ${isOwn ? "outgoing" : "incoming"}`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt={msg.fileName || "attachment"}
                          className="message-image"
                        />
                      )}
                      {msg.fileName && !msg.image && (
                        <div className="file-pill">
                          <span>{msg.fileName}</span>
                        </div>
                      )}
                      {editingMessageId === msg._id ? (
                        <div className="edit-row">
                          <input
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleEditMessage(msg._id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => {
                              setEditingMessageId(null);
                              setEditingText("");
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                      <div className="message-meta">
                        <span className="timestamp">
                          {formatTime(msg.createdAt)}
                        </span>
                        {msg.editedAt && <span className="edited">Edited</span>}
                        {isOwn && msg.readAt && (
                          <span className="read">Read</span>
                        )}
                      </div>
                      {isOwn && editingMessageId !== msg._id && (
                        <div className="message-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMessageId(msg._id);
                              setEditingText(msg.text || "");
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg._id, "me")}
                          >
                            Delete for me
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg._id, "all")}
                          >
                            Delete for all
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {attachment && (
              <div className="attachment-preview">
                <img src={attachment.image} alt="preview" />
                <button type="button" onClick={() => setAttachment(null)}>
                  Remove
                </button>
              </div>
            )}

            <form className="composer" onSubmit={handleSendMessage}>
              <label className="attach">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAttachment(event.target.files[0])}
                />
                📎
              </label>
              <input
                value={messageText}
                onChange={(event) => handleTyping(event.target.value)}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                disabled={!messageText.trim() && !attachment}
              >
                Send
              </button>
            </form>
            {status && <p className="error">{status}</p>}
          </div>
        )}
      </main>

      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((note) => (
            <div key={note.id} className="notification">
              <strong>{note.title}</strong>
              <p>{note.text}</p>
              <button
                type="button"
                className="ghost"
                onClick={() =>
                  setNotifications((prev) =>
                    prev.filter((item) => item.id !== note.id),
                  )
                }
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {profileOpen && (
        <div className="modal">
          <div className="modal-card">
            <h2>Edit profile</h2>
            <form onSubmit={handleProfileUpdate} className="auth-form">
              <label>
                Full name
                <input
                  value={profileForm.fullName}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      fullName: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Avatar URL
                <input
                  value={profileForm.profilePicture}
                  onChange={(event) =>
                    setProfileForm({
                      ...profileForm,
                      profilePicture: event.target.value,
                    })
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setProfileOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
