import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles/InternalMessage.module.css";
import echo from "../../echo";

/* -------------------------
   Mock data (fallback)
   ------------------------- */
const MOCK_CONTACTS = [
  { id: 1, name: "Samir", role: "delivery", avatarColor: "#C05621", unread: 2 },
  { id: 2, name: "Lina", role: "employee", avatarColor: "#065F46", unread: 1 },
  {
    id: 3,
    name: "Omar Supplies",
    role: "supplier",
    avatarColor: "#7C3AED",
    unread: 1,
  },
  { id: 4, name: "Rana", role: "employee", avatarColor: "#B91C1C", unread: 1 },
  { id: 5, name: "Adnan", role: "manager", avatarColor: "#B91C1C", unread: 5 },
  { id: 6, name: "Ahmad", role: "delivery", avatarColor: "#C05621", unread: 1 },
];

const MOCK_MESSAGES = {
  Samir: [
    {
      id: "m1",
      subject: null,
      body: "Hi, I delivered the order to the branch. Where shall I send payment?",
      sender_name: "Samir",
      receiver_name: "Manager",
      sent_at: "2025-08-13T09:10:00Z",
      read_at: null,
    },
    {
      id: "m2",
      subject: null,
      body: "Received. Please send invoice to WhatsApp.",
      sender_name: "Manager",
      receiver_name: "Samir",
      sent_at: "2025-08-13T09:12:00Z",
      read_at: "2025-08-13T09:12:30Z",
    },
  ],
  Lina: [
    {
      id: "m3",
      subject: null,
      body: "Good morning, there is a table reservation at 8pm.",
      sender_name: "Lina",
      receiver_name: "Manager",
      sent_at: "2025-08-12T07:00:00Z",
      read_at: null,
    },
  ],
  "Omar Supplies": [
    {
      id: "m4",
      subject: "Supply Offer",
      body: "We sent a new offer for sugar and coffee. Price attached.",
      sender_name: "Omar Supplies",
      receiver_name: "Manager",
      sent_at: "2025-08-10T15:20:00Z",
      read_at: null,
    },
  ],
};

const roleColors = {
  manager: "#1c5bb9ff",
  employee: "#065F46",
  supplier: "#7C3AED",
  delivery_worker: "#C05621",
};

/* -------------------------
   Helpers
   ------------------------- */
const formatTimeShort = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* -------------------------
   Component (page mode - always mounted)
   ------------------------- */
export default function InternalMessage() {
  const [contacts, setContacts] = useState([]); // always array
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]); // always array
  const [loading, setLoading] = useState(false);
  const [loadingContact, setLoadingContact] = useState(true);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: "Manager",
    role: null,
  });


  /* -------------------------
   Axios client
   ------------------------- */
  function getCurrentToken() {
    const role = sessionStorage.getItem("currentRole");
    if (!role) return null;
    return (
      sessionStorage.getItem(`${role}Token`) ||
      localStorage.getItem(`${role}Token`)
    );
  }

  const token = getCurrentToken();
  const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  /* -------------------------
   Simple API helpers:
   - try real API
   - if it throws -> toast error + use mock
   ------------------------- */
  async function fetchContactsApi() {
    try {
      const res = await apiClient.get("/user/messages/contacts");
      if (!Array.isArray(res.data)) throw new Error("Invalid contacts payload");
      return res.data;
    } catch (err) {
      console.error(err.response.data);
      toast.error("Failed to load contacts — using offline data.");
      return MOCK_CONTACTS;
    }
  }

  async function fetchMessagesApi(contactId, contactName) {
    try {
      const res = await apiClient.get(`/user/messages/thread/${contactId}`);
      if (!Array.isArray(res.data)) throw new Error("Invalid messages payload");
      return res.data;
    } catch (err) {
      console.error(err.response.data);
      toast.error(
        `Failed to load conversation for "${contactName}" — using offline data.`
      );
      return MOCK_MESSAGES[contactName] ? [...MOCK_MESSAGES[contactName]] : [];
    }
  }

  async function postMessageApi(payload) {
    // payload: { subject, body, receiver_name, sender_name }
    try {
      const res = await apiClient.post("/user/messages", payload);
      // assume server returns saved message object
      toast.success("Message sent.");
      return res.data;
    } catch (err) {
      // notify user about failure and fallback to local mock save
      console.error(err);
      toast.error(
        `Failed to send message to ${payload.receiver_name}. Message saved offline.`
      );
      const saved = {
        id: `m_${Date.now()}`,
        subject: payload.subject ?? null,
        body: payload.body,
        sender_name: payload.sender_name,
        receiver_name: payload.receiver_name,
        sent_at: new Date().toISOString(),
        read_at: null,
      };
      if (!MOCK_MESSAGES[payload.receiver_name])
        MOCK_MESSAGES[payload.receiver_name] = [];
      MOCK_MESSAGES[payload.receiver_name].push(saved);
      return saved;
    }
  }
  // fetch current user (leave axios import as-is at top of file)
  async function fetchCurrentUser() {
    try {
      const res = await apiClient.get("/user/current-user");
      return res.data;
    } catch (err) {
      console.error("Error fetching current user:", err);
      toast.error("Error fetching current user:", err);
      return null;
    }
  }

  useEffect(() => {
    if (!token) return;
    fetchCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, [token]);

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log("Setting up WebSocket for user:", currentUser.id);

    const channelName = `messages.${currentUser.id}`;

    try {
      const channel = echo.channel(channelName);

      channel.listen(".message.sent", (e) => {
        console.log("Received message via WebSocket:", e);
        const senderId = e.message.sender_id;
        setContacts((prevContacts) => {
          return prevContacts.map((c) => {
            if (c.id === senderId) {
              const unreadCount =
                active?.id === senderId ? 0 : (c.unread || 0) + 1;
              return {
                ...c,
                unread: unreadCount,
                last_message: e.message.body,
              };
            }
            return c;
          });
        });

        if (active?.id === senderId) {
          setMessages((prev) => [...prev, e.message]);
          markReadApi(senderId);
        }
      });

      // معالج الأخطاء للقناة
      channel.error((error) => {
        console.error("Channel error:", error);
        toast.error("Connection error. Reconnecting...");
      });

      return () => {
        console.log("Cleaning up WebSocket listener");
        channel.stopListening(".message.sent");
        echo.leave(channelName);
      };
    } catch (error) {
      console.error("Failed to set up WebSocket:", error);
      toast.error("Real-time messaging unavailable");
    }
  }, [currentUser?.id, active?.id]);

  async function markReadApi(contactId) {
    try {
      await apiClient.post("/user/messages/mark-read", {
        contact_id: contactId,
      });

      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, unread: 0 } : c))
      );
    } catch (err) {
      console.error(err);
      const contact = contacts.find((c) => c.id === contactId);
      toast.error(
        `Failed to mark messages from "${contact?.name ?? contactId}" as read.`
      );
    }
  }

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  /* fetch contacts once on mount */
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      const result = await fetchContactsApi();
      if (!mounted) return;

      const contactsWithColor = (Array.isArray(result) ? result : []).map(
        (c) => ({
          ...c,
          avatarColor: roleColors[c.role] || "#888888",
        })
      );
      setContacts(contactsWithColor);
      setLoadingContact(false);
    })();
    return () => {
      mounted = false;
    };
  }, [token, contacts]);

  /* fetch messages for active contact */
  useEffect(() => {
    if (!active) {
      setMessages([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      const msgs = await fetchMessagesApi(active.id, active.name);
      if (!mounted) return;
      setMessages(Array.isArray(msgs) ? msgs : []);
      setLoading(false);
      // Optionally mark read here by calling an endpoint
      setTimeout(() => scrollToBottom(), 300);
    })();
    return () => {
      mounted = false;
    };
  }, [active]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  useEffect(() => {
    // السكرول التلقائي عند تغيير الرسائل
    scrollToBottom();
  }, [messages]);

  /* send message (optimistic) */
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!active) return;
    if (!text.trim()) {
      const el = document.querySelector(`.${styles.textarea}`);
      if (el) {
        el.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-6px)" },
            { transform: "translateY(0)" },
          ],
          { duration: 220 }
        );
      }
      return;
    }

    const payload = {
      subject: subject || null,
      body: text,
      receiver_id: active.id,
      sender_id: currentUser?.id,
      receiver_name: active.name,
      sender_name: currentUser?.name ?? "Manager",
    };

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      ...payload,
      id: tempId,
      receiver_name: active.name,
      sender_name: currentUser?.name ?? "Manager",
      sent_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setShowEmoji(false);
    // الانتظار قليلاً ثم السكرول للأسفل
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    try {
      const saved = await postMessageApi(payload);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Sending failed unexpectedly. Please try again.");
    }
  };

  /* emoji handler (emoji-picker-react -> onEmojiClick signature differs by version) */
  const onEmojiClick = (emojiData) => {
    const e = emojiData?.emoji ?? emojiData;
    setText((s) => s + e);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
  };

  /* filtered contacts (safe) */
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const filtered = safeContacts.filter((c) => {
    const name = (c?.name ?? "").toString().toLowerCase();
    const role = (c?.role ?? "").toString().toLowerCase();
    const q = query.toLowerCase();
    return name.includes(q) || role.includes(q);
  });

  function formatRole(role) {
    if (!role) return "";
    const parts = role.split("_");
    const first = parts[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }

  function capitalizeName(name) {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) onClose();
        }}
      >
        <motion.div
          className={styles.modal}
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-label="Internal messages"
        >
          {/* LEFT: contacts */}
          <div className={styles.leftPanel}>
            <div className={styles.leftHeader}>
              <div className={styles.title}>Messages</div>
              <div className={styles.searchBox}>
                <input
                  type="search"
                  placeholder="Search contacts or roles..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search contacts"
                />
              </div>
            </div>

            <div className={styles.contactList} role="list">
              {loadingContact ? (
                <div className={styles.emptyList}>Loading contact...</div>
              ) : (
                filtered.length === 0 && (
                  <div className={styles.emptyList}>No contacts found</div>
                )
              )}

              {filtered.map((c) => (
                <motion.button
                  key={c.id ?? c.name}
                  className={`${styles.contactItem} ${
                    active?.id === c.id ? styles.active : ""
                  }`}
                  onClick={() => {
                    setActive(c);
                    markReadApi(c.id);
                  }}
                  whileHover={{ scale: 1.02 }}
                  role="listitem"
                >
                  <div
                    className={styles.avatar}
                    style={{ background: c.avatarColor ?? "#777" }}
                  >
                    {(c.name ?? "")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.nameRow}>
                      <div className={styles.name}>
                        {capitalizeName(c.name)}
                      </div>
                      <div className={styles.role}>{formatRole(c.role)}</div>
                    </div>
                    <div className={styles.preview}>
                      {c.last_message
                        ? c.last_message.length > 40
                          ? c.last_message.substring(0, 40) + "..."
                          : c.last_message
                        : "No messages yet"}
                    </div>
                  </div>

                  {Number(c.unread) > 0 && (
                    <div
                      className={styles.unreadBadge}
                      aria-label={`${c.unread} unread`}
                    >
                      {c.unread}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className={styles.leftFooter}>
              <small className={styles.small}>
                Internal chat • Cafe Delights
              </small>
            </div>
          </div>

          {/* RIGHT: conversation */}
          <div className={styles.rightPanel}>
            {!active ? (
              <div className={styles.placeholder}>
                <h3 className={styles.placeholderTitle}>
                  Select a contact to start chatting
                </h3>
                <p className={styles.placeholderNote}>
                  Contacts are listed on the left. Click any contact to open the
                  conversation.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.chatHeader}>
                  <div className={styles.headerLeft}>
                    <button
                      className={styles.backButton}
                      onClick={() => setActive(null)}
                      aria-label="Back to contacts"
                    >
                      ←
                    </button>
                    <div
                      className={styles.headerAvatar}
                      style={{ background: active.avatarColor ?? "#666" }}
                    >
                      {(active.name ?? "")
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className={styles.headerInfo}>
                      <div className={styles.headerName}>
                        {capitalizeName(active.name)}
                      </div>
                      <div className={styles.headerRole}>
                        {active.role.split("_").join(" ")}
                      </div>
                    </div>
                  </div>

                  <div className={styles.headerActions}>
                    <button
                      className={styles.closeBtn}
                      onClick={() => onClose()}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className={styles.messagesArea} aria-live="polite">
                  {loading ? (
                    <div className={styles.loading}>
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className={styles.noMessages}>
                      No messages yet. Say hello 👋
                    </div>
                  ) : (
                    messages.map((m) => {
                      const fromMe =
                        m.sender_id != null && currentUser?.id != null
                          ? String(m.sender_id) === String(currentUser.id)
                          : (m.sender_name ?? "") ===
                            (currentUser?.name ?? "Manager");
                      return (
                        <motion.div
                          key={m.id}
                          className={`${styles.messageRow} ${
                            fromMe ? styles.messageRight : styles.messageLeft
                          }`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.16 }}
                        >
                          <div className={styles.bubble}>
                            {m.subject && (
                              <div className={styles.subject}>{m.subject}</div>
                            )}
                            <div className={styles.body}>{m.body}</div>
                            <div className={styles.time}>
                              {formatTimeShort(m.sent_at)}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className={styles.composer} onSubmit={handleSend}>
                  <div className={styles.subjectRow}>
                    <input
                      type="text"
                      className={styles.subjectInput}
                      placeholder="Subject (optional)"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className={styles.composeRow}>
                    <div className={styles.textWrap}>
                      <textarea
                        className={styles.textarea}
                        placeholder={`Message ${active.name}...`}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        aria-label="Message text"
                      />
                      <div className={styles.controls}>
                        <button
                          type="button"
                          className={styles.emojiToggle}
                          onClick={() => setShowEmoji((s) => !s)}
                          aria-label="Toggle emoji picker"
                        >
                          😀
                        </button>
                      </div>

                      <AnimatePresence>
                        {showEmoji && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className={styles.emojiPicker}
                          >
                            <EmojiPicker onEmojiClick={onEmojiClick} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className={styles.sendCol}>
                      <button
                        type="submit"
                        className={styles.sendBtn}
                        aria-label="Send message"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Toast container (keeps toasts local to this component) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
