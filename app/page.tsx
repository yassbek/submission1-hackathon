"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type UserRole = "founder" | "expert" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type MatchForFounder = {
  id: string;
  score: number;
  reason: string;
  status: string;
  need: {
    id: string;
    label: string;
    category: string;
  };
  expert: {
    id: string;
    name: string;
    role: UserRole;
  };
};

type MatchForExpert = {
  id: string;
  score: number;
  reason: string;
  status: string;
  need: {
    id: string;
    label: string;
    category: string;
  };
  requester: {
    id: string;
    name: string;
    role: UserRole;
  };
};

type ChatSlot = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
};

type ChatForUser = {
  id: string;
  status: string;
  meetingLink?: string | null;
  chosenSlotId?: string | null;
  need: {
    id: string;
    label: string;
    category: string;
  };
  requester: {
    id: string;
    name: string;
    role: UserRole;
  };
  expert: {
    id: string;
    name: string;
    role: UserRole;
  };
  proposedSlots: ChatSlot[];
};

type NewSlotPayload = {
  startTime: string;
  endTime: string;
};

type AdminOverview = {
  activeNeedsCount: number;
  activeLearningsCount: number;
  matchSuggestionsCount: number;
  scheduledChatsCount: number;
  needsByCategory: { category: string; count: number }[];
  learningsByCategory: { category: string; count: number }[];
};





const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "fundraising", label: "Fundraising" },
  { value: "branding", label: "Branding" },
  { value: "ux", label: "UX / Research" },
  { value: "marketing", label: "Marketing" },
  { value: "tech", label: "Tech" },
  { value: "ops", label: "Operations" },
  { value: "other", label: "Other" },
];

type DraftItem = {
  label: string;
  category: string;
};

type TabKey = "checkin" | "matches" | "chats" | "admin";

const TABS: { key: TabKey; label: string; roles?: UserRole[] }[] = [
  { key: "checkin", label: "My Check-in" },
  { key: "matches", label: "My Matches" },
  { key: "chats", label: "Coffee Chats" },
  { key: "admin", label: "Admin Dashboard", roles: ["admin"] },
];

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("checkin");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoadingUsers(true);
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error(`Failed to load users: ${res.status}`);
        }
        const data: User[] = await res.json();
        setUsers(data);
        if (data.length > 0) {
          setCurrentUserId(data[0].id);
        }
      } catch (err: any) {
        setErrorUsers(err?.message ?? "Unknown error");
      } finally {
        setLoadingUsers(false);
      }
    }

    loadUsers();
  }, []);

  if (loadingUsers) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading community…
        </div>
      </main>
    );
  }

  if (errorUsers || !currentUserId) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-sm text-slate-600">
          <p>Could not load users.</p>
          {errorUsers && (
            <p className="text-xs text-red-500">{errorUsers}</p>
          )}
        </div>
      </main>
    );
  }

  const currentUser = users.find((u) => u.id === currentUserId)!;

  const visibleTabs = TABS.filter((tab) => {
    if (!tab.roles) return true;
    return tab.roles.includes(currentUser.role);
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">
              MatchFoundry
            </span>
            <span className="text-xs text-slate-500">
              AI-assisted community skill matchmaking for founders
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase">
              Logged in as
            </span>
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm"
              value={currentUserId ?? ""}
              onChange={(e) => setCurrentUserId(e.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Content container */}
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        {/* Welcome + role badge */}
        <section className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            Hi {currentUser.name.split(" ")[0]},
          </h1>
          <p className="text-sm text-slate-600">
            Use this space to share what you need help with and what you&apos;ve
            learned. We&apos;ll match you with founders who can help.
          </p>
          <span className="mt-1 inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-50">
            Role: {currentUser.role}
          </span>
        </section>

        {/* Tabs */}
        <nav className="flex gap-2 border-b border-slate-200">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t-md px-3 py-2 text-sm font-medium ${
                activeTab === tab.key
                  ? "border-b-2 border-slate-900 bg-white text-slate-900"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Active tab content */}
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {activeTab === "checkin" && (
            <CheckInView currentUser={currentUser} />
          )}

          {activeTab === "matches" && (
            <MatchesView currentUser={currentUser} />
          )}

          {activeTab === "chats" && <ChatsView currentUser={currentUser} />}

          {activeTab === "admin" && currentUser.role === "admin" && (
            <AdminDashboardView currentUser={currentUser} />
          )}
        </section>
      </div>
    </main>
  );
}

/**
 * Tab: My Check-in
 */
function CheckInView({ currentUser }: { currentUser: User }) {
  const [freeText, setFreeText] = useState("");
  const [needs, setNeeds] = useState<DraftItem[]>([]);
  const [learnings, setLearnings] = useState<DraftItem[]>([]);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleExtractClick() {
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmed = freeText.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a short weekly update first.");
      return;
    }

    try {
      setLoadingExtract(true);
      const res = await fetch("/api/extract_needs_learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) {
        throw new Error("Failed to extract needs and learnings.");
      }
      const data: { needs: DraftItem[]; learnings: DraftItem[] } =
        await res.json();
      setNeeds(data.needs ?? []);
      setLearnings(data.learnings ?? []);
      setStatusMessage("AI suggestions ready. Review and edit before saving.");
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong.");
    } finally {
      setLoadingExtract(false);
    }
  }

  async function handleSaveClick() {
    setErrorMessage(null);
    setStatusMessage(null);

    if (needs.length === 0 && learnings.length === 0) {
      setErrorMessage("Nothing to save yet. Run AI extraction or add items.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          needs,
          learnings,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save your check-in.");
      }

      setStatusMessage("Check-in saved. We’ll use this to suggest matches.");
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function updateNeedLabel(index: number, label: string) {
    setNeeds((prev) =>
      prev.map((n, i) => (i === index ? { ...n, label } : n))
    );
  }

  function updateNeedCategory(index: number, category: string) {
    setNeeds((prev) =>
      prev.map((n, i) => (i === index ? { ...n, category } : n))
    );
  }

  function updateLearningLabel(index: number, label: string) {
    setLearnings((prev) =>
      prev.map((l, i) => (i === index ? { ...l, label } : l))
    );
  }

  function updateLearningCategory(index: number, category: string) {
    setLearnings((prev) =>
      prev.map((l, i) => (i === index ? { ...l, category } : l))
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Weekly Check-in</h2>
        <p className="text-sm text-slate-600">
          Share a quick update in your own words. AI will extract your needs
          and learnings and suggest matches.
        </p>
      </header>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          This week I&apos;ve been working on…
        </label>
        <textarea
          className="h-32 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
          placeholder="Example: Ran 5 user interviews, struggling to define my target customer. Need help with go-to-market messaging and basic sales funnel."
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExtractClick}
            disabled={loadingExtract}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 shadow-sm hover:bg-slate-800 disabled:opacity-60"
          >
            {loadingExtract
              ? "Extracting with AI…"
              : "Use AI to extract Needs & Learnings"}
          </button>
          <span className="text-xs text-slate-500">
            We&apos;ll keep you in control – you can edit before saving.
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Needs */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Needs
          </h3>
          {needs.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              Once AI runs, you&apos;ll see 1–3 suggested “Needs” here, with
              categories like sales, fundraising, UX.
            </div>
          ) : (
            <div className="space-y-2">
              {needs.map((need, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-2"
                >
                  <input
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm"
                    value={need.label}
                    onChange={(e) =>
                      updateNeedLabel(index, e.target.value)
                    }
                  />
                  <select
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    value={need.category}
                    onChange={(e) =>
                      updateNeedCategory(index, e.target.value)
                    }
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learnings */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Learnings / Skills
          </h3>
          {learnings.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              We&apos;ll also surface what you can offer other founders — recent
              wins, experience, and hard-earned lessons.
            </div>
          ) : (
            <div className="space-y-2">
              {learnings.map((learning, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-2"
                >
                  <input
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm"
                    value={learning.label}
                    onChange={(e) =>
                      updateLearningLabel(index, e.target.value)
                    }
                  />
                  <select
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    value={learning.category}
                    onChange={(e) =>
                      updateLearningCategory(index, e.target.value)
                    }
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status + actions */}
      {(statusMessage || errorMessage) && (
        <div className="text-xs">
          {statusMessage && (
            <p className="text-emerald-600">{statusMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-600">{errorMessage}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveClick}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save check-in"}
        </button>
      </div>
    </div>
  );
}


/**
 * Tab: My Matches
 */
function MatchesView({ currentUser }: { currentUser: User }) {
  const [founderMatches, setFounderMatches] = useState<MatchForFounder[]>([]);
  const [expertMatches, setExpertMatches] = useState<MatchForExpert[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function refreshMatches() {
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      // 1) Recompute matches globally
      const computeRes = await fetch("/api/compute_matches", {
        method: "POST",
      });
      if (!computeRes.ok) {
        throw new Error("Failed to recompute matches.");
      }

      // 2) Load matches for this user
      const res = await fetch(
        `/api/matches?userId=${currentUser.id}&role=${currentUser.role}`
      );
      if (!res.ok) {
        throw new Error("Failed to load matches.");
      }

      if (currentUser.role === "founder") {
        const data: MatchForFounder[] = await res.json();
        setFounderMatches(data);
        setStatusMessage(`Found ${data.length} suggested experts.`);
      } else if (currentUser.role === "expert") {
        const data: MatchForExpert[] = await res.json();
        setExpertMatches(data);
        setStatusMessage(`You have ${data.length} incoming match suggestions.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while matching.");
    } finally {
      setLoading(false);
    }
  }

  // Optionally auto-load when tab is opened for a given user
  useEffect(() => {
    // Do not auto-run for admin
    if (currentUser.role === "admin") return;
    // Initial load without forcing recompute: only fetch existing matches
    (async () => {
      try {
        const res = await fetch(
          `/api/matches?userId=${currentUser.id}&role=${currentUser.role}`
        );
        if (!res.ok) return;
        if (currentUser.role === "founder") {
          const data: MatchForFounder[] = await res.json();
          setFounderMatches(data);
        } else if (currentUser.role === "expert") {
          const data: MatchForExpert[] = await res.json();
          setExpertMatches(data);
        }
      } catch {
        // ignore initial errors
      }
    })();
  }, [currentUser.id, currentUser.role]);

  if (currentUser.role === "admin") {
    return (
      <div className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold">My Matches</h2>
          <p className="text-sm text-slate-600">
            Switch to a founder or expert account to see personal matches.
          </p>
        </header>
      </div>
    );
  }

  const isFounder = currentUser.role === "founder";

    async function handleRequestChat(match: MatchForFounder) {
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needId: match.need.id,
          requesterId: currentUser.id,
          expertId: match.expert.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create coffee chat request.");
      }

      setStatusMessage(
        `Coffee chat requested with ${match.expert.name}. They will propose 3 time slots.`
      );
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while requesting chat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Matches</h2>
          <p className="text-sm text-slate-600">
            {isFounder
              ? "Based on your active needs and learnings, AI suggests founders who can help you."
              : "These are founders whose needs align with your experience and learnings."}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshMatches}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Refreshing matches…" : "Refresh AI matches"}
        </button>
      </header>

      {(statusMessage || errorMessage) && (
        <div className="text-xs">
          {statusMessage && (
            <p className="text-emerald-600">{statusMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-600">{errorMessage}</p>
          )}
        </div>
      )}

      {isFounder ? (
        founderMatches.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No matches yet. Make sure you have at least one active need in your
            weekly check-in, then click &quot;Refresh AI matches&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {founderMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Need
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{m.need.label}</p>
                    <p className="text-xs text-slate-500">
                      Category: {m.need.category}
                    </p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    Confidence: {(m.score * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Suggested expert
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{m.expert.name}</p>
                      <p className="text-xs text-slate-500">
                        {m.reason}
                      </p>
                    </div>
                    {/* Coffee chat request will be wired here later */}
                    <button
                      type="button"
                      onClick={() => handleRequestChat(m)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Request 30-min coffee chat
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : // Expert view
      expertMatches.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No incoming matches yet. Once founders share their needs, AI will
          suggest where you can help.
        </div>
      ) : (
        <div className="space-y-3">
          {expertMatches.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Founder who might need you
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{m.requester.name}</p>
                  <p className="text-xs text-slate-500">
                    Need: {m.need.label}
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  Confidence: {(m.score * 100).toFixed(0)}%
                </div>
              </div>
              <p className="text-xs text-slate-500">{m.reason}</p>
              {/* Later we’ll allow experts to accept & schedule from here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * Tab: Coffee Chats
 */
function ChatsView({ currentUser }: { currentUser: User }) {
  const [chats, setChats] = useState<ChatForUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedChatForSlots, setSelectedChatForSlots] = useState<ChatForUser | null>(null);
  const [slot1, setSlot1] = useState<Date | null>(null);
  const [slot2, setSlot2] = useState<Date | null>(null);
  const [slot3, setSlot3] = useState<Date | null>(null);

  async function loadChats() {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const res = await fetch(
        `/api/chats?userId=${currentUser.id}&role=${currentUser.role}`
      );
      if (!res.ok) {
        throw new Error("Failed to load chats.");
      }
      const data: ChatForUser[] = await res.json();
      setChats(data);
      setStatusMessage(`Loaded ${data.length} coffee chats.`);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while loading chats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChats();
  }, [currentUser.id, currentUser.role]);

  function formatSlotTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  function openTimePicker(chat: ChatForUser) {
    setSelectedChatForSlots(chat);
    // Set default times (tomorrow at 10am, 2pm, and day after at 11am)
    const now = new Date();
    const tomorrow10am = new Date(now);
    tomorrow10am.setDate(tomorrow10am.getDate() + 1);
    tomorrow10am.setHours(10, 0, 0, 0);

    const tomorrow2pm = new Date(now);
    tomorrow2pm.setDate(tomorrow2pm.getDate() + 1);
    tomorrow2pm.setHours(14, 0, 0, 0);

    const dayAfter11am = new Date(now);
    dayAfter11am.setDate(dayAfter11am.getDate() + 2);
    dayAfter11am.setHours(11, 0, 0, 0);

    setSlot1(tomorrow10am);
    setSlot2(tomorrow2pm);
    setSlot3(dayAfter11am);
    setShowTimePickerModal(true);
  }

  async function submitCustomSlots() {
    if (!selectedChatForSlots || !slot1 || !slot2 || !slot3) {
      setErrorMessage("Please select all 3 time slots");
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const slots: NewSlotPayload[] = [
        {
          startTime: slot1.toISOString(),
          endTime: new Date(slot1.getTime() + 30 * 60 * 1000).toISOString(),
        },
        {
          startTime: slot2.toISOString(),
          endTime: new Date(slot2.getTime() + 30 * 60 * 1000).toISOString(),
        },
        {
          startTime: slot3.toISOString(),
          endTime: new Date(slot3.getTime() + 30 * 60 * 1000).toISOString(),
        },
      ];

      const res = await fetch(`/api/chats/${selectedChatForSlots.id}/propose_slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });

      if (!res.ok) {
        throw new Error("Failed to propose slots.");
      }

      setStatusMessage("Proposed 3 time slots for this chat.");
      setShowTimePickerModal(false);
      setSelectedChatForSlots(null);
      await loadChats();
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while proposing slots.");
    } finally {
      setLoading(false);
    }
  }


  async function handleSelectSlot(chatId: string, slotId: string) {
    setErrorMessage(null);
    setStatusMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/chats/${chatId}/select_slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });

      if (!res.ok) {
        throw new Error("Failed to select slot.");
      }

      setStatusMessage("Coffee chat scheduled. Meeting link created.");
      await loadChats();
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong while selecting slot.");
    } finally {
      setLoading(false);
    }
  }

  const isFounder = currentUser.role === "founder";
  const isExpert = currentUser.role === "expert";

  const pending = chats.filter(
    (c) => c.proposedSlots.length === 0 && c.status === "proposed"
  );
  const chooseTime = chats.filter(
    (c) => c.proposedSlots.length > 0 && !c.chosenSlotId
  );
  const upcoming = chats.filter((c) => c.status === "scheduled");

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Coffee Chats</h2>
          <p className="text-sm text-slate-600">
            Lightweight scheduling for peer support.{" "}
            {isFounder
              ? "You’ll see your requests and confirmed chats here."
              : isExpert
              ? "You’ll see incoming requests from founders and schedule times."
              : "Switch to a founder or expert to see their chats."}
          </p>
        </div>
        {(isFounder || isExpert) && (
          <button
            type="button"
            onClick={loadChats}
            disabled={loading}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </header>

      {(statusMessage || errorMessage) && (
        <div className="text-xs">
          {statusMessage && (
            <p className="text-emerald-600">{statusMessage}</p>
          )}
          {errorMessage && (
            <p className="text-red-600">{errorMessage}</p>
          )}
        </div>
      )}

      {!isFounder && !isExpert ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          As an admin, you&apos;ll later get an overview of all chats. For now,
          use founder/expert views to demo the flow.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Column 1: Pending */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending
            </h3>
            {pending.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                No pending chats right now.
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((chat) => (
                  <div
                    key={chat.id}
                    className="space-y-1 rounded-md border border-slate-200 bg-white p-2 text-xs"
                  >
                    <p className="font-semibold">
                      {isFounder
                        ? `Waiting for ${chat.expert.name}`
                        : `Request from ${chat.requester.name}`}
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Topic: {chat.need.label}
                    </p>
                    {isExpert && (
                      <button
                        type="button"
                        onClick={() => openTimePicker(chat)}
                        className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Propose 3 slots
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Choose a time */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Choose a time
            </h3>
            {chooseTime.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                {isFounder
                  ? "When an expert proposes 3 slots, you’ll choose one here."
                  : "After you propose slots, the founder will pick one."}
              </div>
            ) : (
              <div className="space-y-2">
                {chooseTime.map((chat) => (
                  <div
                    key={chat.id}
                    className="space-y-1 rounded-md border border-slate-200 bg-white p-2 text-xs"
                  >
                    <p className="font-semibold">
                      {isFounder
                        ? `Slots from ${chat.expert.name}`
                        : `Slots you proposed to ${chat.requester.name}`}
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      Topic: {chat.need.label}
                    </p>
                    {isFounder ? (
                      <div className="mt-1 space-y-1">
                        {chat.proposedSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              handleSelectSlot(chat.id, slot.id)
                            }
                            className="w-full rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            {formatSlotTime(slot.startTime)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1 text-[11px] text-slate-600">
                        {chat.proposedSlots.map((slot) => (
                          <div key={slot.id}>
                            {formatSlotTime(slot.startTime)} (
                            {slot.status})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Upcoming */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Upcoming chats
            </h3>
            {upcoming.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Once a slot is chosen, your confirmed chats will show up here
                with a meeting link.
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((chat) => {
                  const slot = chat.proposedSlots.find(
                    (s) => s.id === chat.chosenSlotId
                  );
                  return (
                    <div
                      key={chat.id}
                      className="space-y-1 rounded-md border border-slate-200 bg-white p-2 text-xs"
                    >
                      <p className="font-semibold">
                        {isFounder
                          ? `With ${chat.expert.name}`
                          : `With ${chat.requester.name}`}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Topic: {chat.need.label}
                      </p>
                      {slot && (
                        <p className="text-[11px] text-slate-600">
                          When: {formatSlotTime(slot.startTime)}
                        </p>
                      )}
                      {chat.meetingLink && (
                        <div className="mt-2">
                          <a
                            href={chat.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full rounded-md bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            🎥 Join Jitsi Meeting
                          </a>
                          <p className="mt-1 text-[10px] text-slate-500">
                            Meeting opens in new window
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Picker Modal */}
      {showTimePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Propose 3 Time Slots
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Select 3 available times for your coffee chat with{" "}
              {selectedChatForSlots?.requester.name}
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Slot 1
                </label>
                <DatePicker
                  selected={slot1}
                  onChange={(date) => setSlot1(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Slot 2
                </label>
                <DatePicker
                  selected={slot2}
                  onChange={(date) => setSlot2(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Slot 3
                </label>
                <DatePicker
                  selected={slot3}
                  onChange={(date) => setSlot3(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  dateFormat="MMM d, yyyy h:mm aa"
                  minDate={new Date()}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowTimePickerModal(false);
                  setSelectedChatForSlots(null);
                }}
                className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCustomSlots}
                disabled={loading || !slot1 || !slot2 || !slot3}
                className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Proposing..." : "Propose Slots"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Tab: Admin Dashboard
 */
function AdminDashboardView({ currentUser }: { currentUser: User }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        throw new Error("Failed to load community overview.");
      }
      const data: AdminOverview = await res.json();
      setOverview(data);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Community Dashboard</h2>
          <p className="text-sm text-slate-600">
            As a community manager, you can see what founders need, what they
            can offer, and how well the community is connecting.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}

      {/* Top-level KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active needs
          </h3>
          <p className="text-2xl font-semibold">
            {overview ? overview.activeNeedsCount : "–"}
          </p>
          <p className="text-xs text-slate-500">
            How many live “I need help with…” items are in the community.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active learnings
          </h3>
          <p className="text-2xl font-semibold">
            {overview ? overview.activeLearningsCount : "–"}
          </p>
          <p className="text-xs text-slate-500">
            Recent experiences founders can offer to others.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Suggested matches
          </h3>
          <p className="text-2xl font-semibold">
            {overview ? overview.matchSuggestionsCount : "–"}
          </p>
          <p className="text-xs text-slate-500">
            AI-generated founder-to-founder introductions.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Coffee chats scheduled
          </h3>
          <p className="text-2xl font-semibold">
            {overview ? overview.scheduledChatsCount : "–"}
          </p>
          <p className="text-xs text-slate-500">
            Confirmed 30-minute sessions with a time and meeting link.
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Needs by category
          </h3>
          {overview && overview.needsByCategory.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="py-1">Category</th>
                  <th className="py-1 text-right">Active needs</th>
                </tr>
              </thead>
              <tbody>
                {overview.needsByCategory.map((item) => (
                  <tr key={item.category}>
                    <td className="py-1 capitalize text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-1 text-right text-slate-700">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500">
              Once founders start sharing, you&apos;ll see where support is
              needed most (sales, UX, fundraising, etc.).
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Learnings by category
          </h3>
          {overview && overview.learningsByCategory.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="py-1">Category</th>
                  <th className="py-1 text-right">Active learnings</th>
                </tr>
              </thead>
              <tbody>
                {overview.learningsByCategory.map((item) => (
                  <tr key={item.category}>
                    <td className="py-1 capitalize text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-1 text-right text-slate-700">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500">
              As founders ship and learn, you&apos;ll see the skill graph of
              your community here.
            </p>
          )}
        </div>
      </div>

      {/* Hint about future manual matches */}
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Future idea: allow admins to trigger manual matches from here for
        high-priority founders, and export a weekly report of community health
        (top needs, most active helpers, etc.).
      </div>
    </div>
  );
}

