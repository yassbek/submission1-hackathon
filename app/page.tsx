"use client";

import { useState } from "react";

type UserRole = "founder" | "expert" | "admin";

type User = {
  id: string;
  name: string;
  role: UserRole;
};

const SAMPLE_USERS: User[] = [
  { id: "u1", name: "Alice (Founder)", role: "founder" },
  { id: "u2", name: "Bob (Expert Founder)", role: "expert" },
  { id: "u3", name: "Carla (Community Manager)", role: "admin" },
];

type TabKey = "checkin" | "matches" | "chats" | "admin";

const TABS: { key: TabKey; label: string; roles?: UserRole[] }[] = [
  { key: "checkin", label: "My Check-in" },
  { key: "matches", label: "My Matches" },
  { key: "chats", label: "Coffee Chats" },
  { key: "admin", label: "Admin Dashboard", roles: ["admin"] },
];

export default function HomePage() {
  const [currentUserId, setCurrentUserId] = useState<string>(SAMPLE_USERS[0].id);
  const currentUser = SAMPLE_USERS.find((u) => u.id === currentUserId)!;

  const [activeTab, setActiveTab] = useState<TabKey>("checkin");

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
              value={currentUserId}
              onChange={(e) => setCurrentUserId(e.target.value)}
            >
              {SAMPLE_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
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
 * (Placeholder for now – we will wire AI + backend later.)
 */
function CheckInView({ currentUser }: { currentUser: User }) {
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
        />
        <div className="flex flex-wrap gap-2">
          <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-50 shadow-sm hover:bg-slate-800">
            Use AI to extract Needs &amp; Learnings
          </button>
          <span className="text-xs text-slate-500">
            We&apos;ll keep you in control – you can edit before saving.
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Needs (AI suggestions will appear here)
          </h3>
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Once AI runs, you&apos;ll see 1–3 suggested “Needs” here, with
            categories like sales, fundraising, UX.
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Learnings / Skills
          </h3>
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            We&apos;ll also surface what you can offer other founders — recent
            wins, experience, and hard-earned lessons.
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300">
          Save for later (placeholder)
        </button>
      </div>
    </div>
  );
}

/**
 * Tab: My Matches
 */
function MatchesView({ currentUser }: { currentUser: User }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">My Matches</h2>
        <p className="text-sm text-slate-600">
          When you share your needs and learnings, AI will connect you with
          founders who can help – or who can learn from you.
        </p>
      </header>

      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        No matches yet – run a weekly check-in first and we&apos;ll suggest
        30-minute coffee chats here.
      </div>
    </div>
  );
}

/**
 * Tab: Coffee Chats
 */
function ChatsView({ currentUser }: { currentUser: User }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Coffee Chats</h2>
        <p className="text-sm text-slate-600">
          This is your lightweight scheduler for peer-to-peer support.
          You&apos;ll see incoming requests, proposed time slots, and upcoming
          sessions here.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pending
          </h3>
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Any new requests will appear here.
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Choose a time
          </h3>
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            When an expert proposes 3 slots, you&apos;ll pick one here.
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Upcoming chats
          </h3>
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            Confirmed 30-minute coffee chats – with a meeting link – will show
            up here.
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Tab: Admin Dashboard
 */
function AdminDashboardView({ currentUser }: { currentUser: User }) {
  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold">Community Dashboard</h2>
        <p className="text-sm text-slate-600">
          As a community manager, you can see what founders need, what they can
          offer, and how well the community is connecting.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active needs
          </h3>
          <p className="text-2xl font-semibold">0</p>
          <p className="text-xs text-slate-500">
            Once founders share, you&apos;ll see an overview here.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Suggested matches
          </h3>
          <p className="text-2xl font-semibold">0</p>
          <p className="text-xs text-slate-500">
            AI will propose pairings based on skills, needs, and themes.
          </p>
        </div>

        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Coffee chats scheduled
          </h3>
          <p className="text-2xl font-semibold">0</p>
          <p className="text-xs text-slate-500">
            Track the actual peer-to-peer touchpoints happening each week.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Later we&apos;ll add:
        <ul className="mt-1 list-disc pl-4">
          <li>Aggregated needs and skills by category (sales, UX, funding).</li>
          <li>Full list of match suggestions and their status.</li>
          <li>Manual match triggers for high-priority founders.</li>
        </ul>
      </div>
    </div>
  );
}
