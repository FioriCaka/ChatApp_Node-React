import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { authApi, messagesApi, getApiUrl, setApiUrl } from "./api";
import AuthView from "./components/AuthView";
import ChatPanel from "./components/ChatPanel";
import ForwardModal from "./components/ForwardModal";
import Notifications from "./components/Notifications";
import ProfileModal from "./components/ProfileModal";
import ServerSettingsModal from "./components/ServerSettingsModal";
import Sidebar from "./components/Sidebar";
import { EMOTES, STICKERS } from "./lib/chatConstants";

const emptyForm = { fullName: "", email: "", password: "" };
const emptyProfile = { fullName: "", profilePicture: "" };

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [forwardFrom, setForwardFrom] = useState(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [selectedForwardContact, setSelectedForwardContact] = useState(null);
  const [showEmotes, setShowEmotes] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [sticker, setSticker] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [serverOpen, setServerOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiUrl());

  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const contactsRef = useRef([]);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

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

  const resolveImageUrl = (value) => {
    if (!value) return "";
    if (value.startsWith("http") || value.startsWith("data:")) return value;
    return `${getApiUrl()}${value}`;
  };

  const withProfileImage = (entity) => {
    if (!entity) return entity;
    return {
      ...entity,
      profilePicture: resolveImageUrl(entity.profilePicture),
    };
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
    setContacts(data.map(withProfileImage));
  };

  const loadChats = async () => {
    const data = await messagesApi.chats();
    setChats(
      data.map((chat) => ({
        ...chat,
        user: withProfileImage(chat.user),
      })),
    );
  };

  const loadMessages = async (contactId) => {
    if (!contactId) return;
    const data = await messagesApi.messages(contactId);
    setMessages(data);
    if (socketRef.current && user?._id) {
      data
        .filter(
          (msg) =>
            msg.receiverId === user._id && !msg.deliveredAt && !msg.readAt,
        )
        .forEach((msg) =>
          socketRef.current.emit("message:delivered", {
            messageId: msg._id,
          }),
        );
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distance =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      isAtBottomRef.current = distance < 80;
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeContactId]);

  useEffect(() => {
    if (!activeContactId) return;
    if (messages.length > prevMessageCountRef.current) {
      if (isAtBottomRef.current || prevMessageCountRef.current === 0) {
        scrollToBottom();
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, activeContactId]);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await authApi.me();
        setUser(withProfileImage(me));
        setProfileForm({
          fullName: me.fullName || "",
          profilePicture: resolveImageUrl(me.profilePicture || ""),
        });
        await Promise.all([loadContacts(), loadChats()]);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const updateVvh = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vvh", `${height}px`);
    };

    updateVvh();
    window.visualViewport?.addEventListener("resize", updateVvh);
    window.addEventListener("resize", updateVvh);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateVvh);
      window.removeEventListener("resize", updateVvh);
    };
  }, []);

  useEffect(() => {
    contactsRef.current = contacts;
  }, [contacts]);

  useEffect(() => {
    if (!user) return;
    const socket = io(getApiUrl(), { withCredentials: true });
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
      socket.emit("message:delivered", { messageId: payload._id });
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
            ? {
                ...msg,
                readAt: new Date().toISOString(),
                deliveredAt: msg.deliveredAt || new Date().toISOString(),
              }
            : msg,
        ),
      );
      loadChats();
    });

    socket.on("message:delivered", ({ messageId, deliveredAt }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, deliveredAt: deliveredAt || new Date().toISOString() }
            : msg,
        ),
      );
    });

    socket.on("typing", ({ from, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [from]: isTyping,
      }));
    });

    socket.on("message:reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg,
        ),
      );
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

      setUser(withProfileImage(data));
      setProfileForm({
        fullName: data.fullName || "",
        profilePicture: resolveImageUrl(data.profilePicture || ""),
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
    setReplyTo(null);
    setSidebarOpen(false);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (
      !activeContactId ||
      (!messageText.trim() && !attachment && !forwardFrom && !sticker)
    )
      return;
    setStatus("");
    try {
      const sent = await messagesApi.send(activeContactId, {
        message: messageText.trim(),
        image: attachment?.image || "",
        fileUrl: attachment?.fileUrl || "",
        fileName: attachment?.fileName || "",
        fileType: attachment?.fileType || "",
        fileSize: attachment?.fileSize || null,
        stickerUrl: sticker?.url || "",
        stickerName: sticker?.name || "",
        stickerType: sticker?.type || "",
        replyToId: replyTo?._id || null,
        forwardFromId: forwardFrom?._id || null,
      });
      setMessageText("");
      setAttachment(null);
      setSticker(null);
      setReplyTo(null);
      setForwardFrom(null);
      setMessages((prev) => [...prev, sent]);
      setChats((prev) => {
        const lastMessage = {
          _id: sent._id,
          text: sent.text,
          image: sent.image,
          fileUrl: sent.fileUrl,
          fileName: sent.fileName,
          fileType: sent.fileType,
          createdAt: sent.createdAt,
          senderId: sent.senderId,
          receiverId: sent.receiverId,
          readAt: sent.readAt,
          editedAt: sent.editedAt,
          deliveredAt: sent.deliveredAt,
          replyPreview: sent.replyPreview,
          forwardedFrom: sent.forwardedFrom,
          stickerName: sent.stickerName,
          stickerUrl: sent.stickerUrl,
          stickerType: sent.stickerType,
        };

        const index = prev.findIndex(
          (chat) => String(chat.user?._id) === String(activeContactId),
        );

        if (index >= 0) {
          const updatedChat = {
            ...prev[index],
            lastMessage,
          };
          return [
            updatedChat,
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ];
        }

        if (!activeContact) return prev;

        return [
          {
            user: activeContact,
            unreadCount: 0,
            lastMessage,
          },
          ...prev,
        ];
      });
      setTimeout(() => {
        loadChats();
      }, 800);
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

  const handleAttachment = async (file) => {
    if (!file) return;
    setStatus("");
    try {
      const uploaded = await messagesApi.upload(file);
      setAttachment({
        image: uploaded.fileType?.startsWith("image/") ? uploaded.fileUrl : "",
        fileUrl: uploaded.fileUrl,
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
      });
      setSticker(null);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const insertEmote = (emote) => {
    setMessageText((prev) => `${prev}${emote}`);
  };

  const handleStickerSelect = (selected) => {
    setSticker(selected);
    setAttachment(null);
    setShowStickers(false);
  };

  const handleReact = async (messageId, emoji) => {
    try {
      await messagesApi.react(messageId, { emoji });
    } catch (error) {
      handleAuthError(error);
    }
  };

  const openForward = (message) => {
    setForwardFrom(message);
    setForwardOpen(true);
    setSelectedForwardContact(null);
  };

  const submitForward = async () => {
    if (!selectedForwardContact || !forwardFrom) return;
    setStatus("");
    try {
      await messagesApi.send(selectedForwardContact._id, {
        message: "",
        forwardFromId: forwardFrom._id,
      });
      setForwardOpen(false);
      setForwardFrom(null);
      setSelectedForwardContact(null);
      await Promise.all([
        loadChats(),
        activeContactId ? loadMessages(activeContactId) : Promise.resolve(),
      ]);
    } catch (error) {
      handleAuthError(error);
    }
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
      let updatedUser = user;
      if (profileForm.fullName && profileForm.fullName !== user.fullName) {
        updatedUser = await authApi.updateProfile({
          fullName: profileForm.fullName,
        });
        setUser(withProfileImage(updatedUser));
      }
      if (profileFile) {
        updatedUser = await authApi.uploadProfilePicture(profileFile);
        setUser(withProfileImage(updatedUser));
        setProfileFile(null);
        setProfilePreview("");
      }
      setProfileOpen(false);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleProfileFieldChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileFileChange = (file) => {
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleServerSave = () => {
    if (!serverUrl.trim()) return;
    setApiUrl(serverUrl.trim());
    setServerOpen(false);
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="bg-slate-950 text-slate-200 grid place-items-center overflow-hidden h-(--vvh) min-h-(--vvh) max-h-(--vvh)">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl text-slate-900 font-bold grid place-items-center">
            <img
              src="/voice_wave_icon_black.png"
              alt="Loading"
              className="w-16 h-16 object-cover"
            />
          </div>
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthView
        authMode={authMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        loading={loading}
        onSubmit={handleAuthSubmit}
        onToggleMode={() =>
          setAuthMode(authMode === "login" ? "signup" : "login")
        }
      />
    );
  }

  const sendDisabled =
    !messageText.trim() && !attachment && !forwardFrom && !sticker;

  return (
    <div className="relative theme-app-bg liquid-shell liquid-motion overflow-hidden h-(--vvh) min-h-(--vvh) max-h-(--vvh)">
      <div className="liquid-blobs" aria-hidden="true">
        <span className="liquid-blob one" />
        <span className="liquid-blob two" />
        <span className="liquid-blob three" />
      </div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] h-full">
        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 bg-slate-900/40 border-0 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}

        <Sidebar
          user={user}
          avatar={avatar}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onOpenServer={() => setServerOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
          search={search}
          onSearchChange={setSearch}
          tab={tab}
          onTabChange={setTab}
          filteredChats={filteredChats}
          filteredContacts={filteredContacts}
          activeContactId={activeContactId}
          contactInitials={contactInitials}
          selectContact={selectContact}
          onlineIds={onlineIds}
        />

        <ChatPanel
          activeContact={activeContact}
          user={user}
          typingUsers={typingUsers}
          onlineIds={onlineIds}
          contactInitials={contactInitials}
          onOpenSidebar={() => setSidebarOpen(true)}
          onCloseChat={() => setActiveContact(null)}
          messages={messages}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          editingMessageId={editingMessageId}
          editingText={editingText}
          onEditTextChange={setEditingText}
          onStartEdit={(msg) => {
            setEditingMessageId(msg._id);
            setEditingText(msg.text || "");
          }}
          onSaveEdit={handleEditMessage}
          onCancelEdit={() => {
            setEditingMessageId(null);
            setEditingText("");
          }}
          onReply={(msg) => {
            setReplyTo(msg);
            setForwardFrom(null);
          }}
          onForward={openForward}
          onReact={handleReact}
          onDelete={handleDeleteMessage}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          attachment={attachment}
          onRemoveAttachment={() => setAttachment(null)}
          sticker={sticker}
          onRemoveSticker={() => setSticker(null)}
          messageText={messageText}
          onMessageChange={handleTyping}
          onSendMessage={handleSendMessage}
          onAttachment={handleAttachment}
          showEmotes={showEmotes}
          showStickers={showStickers}
          onToggleEmotes={() => setShowEmotes((prev) => !prev)}
          onToggleStickers={() => setShowStickers((prev) => !prev)}
          onClosePickers={() => {
            setShowEmotes(false);
            setShowStickers(false);
          }}
          emotes={EMOTES}
          stickers={STICKERS}
          onInsertEmote={insertEmote}
          onSelectSticker={handleStickerSelect}
          sendDisabled={sendDisabled}
          status={status}
        />

        <Notifications
          notifications={notifications}
          onDismiss={(id) =>
            setNotifications((prev) => prev.filter((item) => item.id !== id))
          }
        />

        <ServerSettingsModal
          open={serverOpen}
          serverUrl={serverUrl}
          onChange={setServerUrl}
          onSave={handleServerSave}
          onClose={() => setServerOpen(false)}
        />

        <ProfileModal
          profileOpen={profileOpen}
          profileForm={profileForm}
          profilePreview={profilePreview || profileForm.profilePicture}
          onChange={handleProfileFieldChange}
          onFileChange={handleProfileFileChange}
          onSubmit={handleProfileUpdate}
          onClose={() => setProfileOpen(false)}
        />

        <ForwardModal
          forwardOpen={forwardOpen}
          contacts={contacts}
          selectedForwardContact={selectedForwardContact}
          onSelectContact={setSelectedForwardContact}
          onSend={submitForward}
          onCancel={() => {
            setForwardOpen(false);
            setForwardFrom(null);
            setSelectedForwardContact(null);
          }}
          contactInitials={contactInitials}
        />
      </div>
    </div>
  );
}

export default App;
