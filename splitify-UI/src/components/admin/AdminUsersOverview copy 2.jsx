import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getUsers } from "../../queries/user";

const PLAN_COLORS = {
  premium: "#6366F1", // indigo
  pro: "#10B981", // green
  basic: "#F59E0B", // amber
  unknown: "#9CA3AF", // gray
};

export default function AdminUsersOverview() {
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [activeWindow, setActiveWindow] = useState("24h"); // 24h | 7d | 30d
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await getUsers();
      setUsers(res.items || []);
    }
    fetchUsers();
  }, []);

  const data = users;

  // ===== Helpers =====
  const now = useMemo(() => new Date(), []);
  const asDate = (v) => {
    if (!v) return null;
    if (typeof v === "string" || v instanceof Date) return new Date(v);
    if (v.$date) return new Date(v.$date);
    return null;
  };
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const within = (date, days) => (date ? date >= daysAgo(days) : false);
  const mask = (s, vis = 4) =>
    s && s.length > vis ? `${s.slice(0, vis)}•••${s.slice(-3)}` : s || "—";

  const countHistoryWithinDays = (history, days) => {
    if (!Array.isArray(history) || !history.length) return 0;
    const cutoff = daysAgo(days).getTime();
    let n = 0;
    for (const h of history) {
      const d = asDate(h?.at);
      if (d && d.getTime() >= cutoff) n++;
    }
    return n;
  };

  // ===== Derived: filtering =====
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((u) => {
      if (planFilter !== "all" && (u.plan || "").toLowerCase() !== planFilter)
        return false;
      if (!q) return true;
      const hay = [u.name, u.email, u.plan, u.role, u.stripeCustomerId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, planFilter, query]);

  // ===== Derived: counts & charts =====
  const counts = useMemo(() => {
    const c = {
      total: filtered.length,
      new7d: 0,
      new30d: 0,
      active24h: 0,
      active7d: 0,
      active30d: 0,
      withPlaid: 0,
      withStripe: 0,
      byPlan: {},
      totalRequests: 0,
      messages: {
        textTotal: 0,
        emailTotal: 0,
        text24h: 0,
        email24h: 0,
        text7d: 0,
        email7d: 0,
        text30d: 0,
        email30d: 0,
      },
    };

    filtered.forEach((u) => {
      const created = asDate(u.createdAt);
      const lastActive = asDate(u.lastActive);
      if (within(created, 7)) c.new7d++;
      if (within(created, 30)) c.new30d++;
      if (within(lastActive, 1)) c.active24h++;
      if (within(lastActive, 7)) c.active7d++;
      if (within(lastActive, 30)) c.active30d++;
      if (u?.plaid?.isEnabled) c.withPlaid++;
      if (u?.stripeCustomerId) c.withStripe++;
      const p = (u.plan || "unknown").toLowerCase();
      c.byPlan[p] = (c.byPlan[p] || 0) + 1;
      if (Array.isArray(u.requests)) c.totalRequests += u.requests.length;

      // ---- Messages
      const ms = u?.messagesSent || {};
      const t = ms.text || {};
      const e = ms.email || {};
      c.messages.textTotal += Number(t.total || 0);
      c.messages.emailTotal += Number(e.total || 0);
      c.messages.text24h += countHistoryWithinDays(t.history, 1);
      c.messages.email24h += countHistoryWithinDays(e.history, 1);
      c.messages.text7d += countHistoryWithinDays(t.history, 7);
      c.messages.email7d += countHistoryWithinDays(e.history, 7);
      c.messages.text30d += countHistoryWithinDays(t.history, 30);
      c.messages.email30d += countHistoryWithinDays(e.history, 30);
    });
    return c;
  }, [filtered]);

  const planPie = useMemo(
    () =>
      Object.entries(counts.byPlan).map(([name, value]) => ({ name, value })),
    [counts.byPlan]
  );

  const dailySignups = useMemo(() => {
    const lastN = 14;
    const map = new Map();
    for (let i = lastN - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = fmtDay(d);
      map.set(key, 0);
    }
    filtered.forEach((u) => {
      const d = asDate(u.createdAt);
      if (!d) return;
      const key = fmtDay(d);
      if (map.has(key)) map.set(key, map.get(key) + 1);
    });
    return Array.from(map, ([day, count]) => ({ day, count }));
  }, [filtered]);

  const newUsersList = useMemo(
    () =>
      filtered
        .filter((u) => within(asDate(u.createdAt), 7))
        .sort((a, b) => asDate(b.createdAt) - asDate(a.createdAt))
        .slice(0, 10),
    [filtered]
  );

  const activeWindowDays =
    activeWindow === "24h" ? 1 : activeWindow === "7d" ? 7 : 30;
  const activeUsersList = useMemo(
    () =>
      filtered
        .filter((u) => within(asDate(u.lastActive), activeWindowDays))
        .sort((a, b) => asDate(b.lastActive) - asDate(a.lastActive))
        .slice(0, 10),
    [filtered, activeWindowDays]
  );

  const usersWithPlaid = useMemo(
    () => filtered.filter((u) => u?.plaid?.isEnabled).slice(0, 10),
    [filtered]
  );

  const usersStripe = useMemo(
    () => filtered.filter((u) => u.stripeCustomerId).slice(0, 10),
    [filtered]
  );

  // ===== Requests derived data =====
  const allRequests = useMemo(() => {
    const list = [];
    filtered.forEach((u) => {
      const reqs = Array.isArray(u.requests) ? u.requests : [];
      reqs.forEach((r) => {
        if (r && typeof r === "object" && !r.$oid) {
          list.push({
            ...r,
            _ownerUser: u,
            _ownerName: u.name || u.email || "—",
            _ownerEmail: u.email || "—",
          });
        }
      });
    });
    return list.sort(
      (a, b) => (asDate(b.createdAt) || 0) - (asDate(a.createdAt) || 0)
    );
  }, [filtered]);

  const latestRequests = useMemo(() => allRequests.slice(0, 10), [allRequests]);

  const requestsByUser = useMemo(() => {
    return filtered
      .map((u) => {
        const reqs = (u.requests || []).filter((r) => r && r._id && !r.$oid);
        return { user: u, requests: reqs };
      })
      .filter((row) => row.requests.length > 0)
      .sort((a, b) => b.requests.length - a.requests.length);
  }, [filtered]);

  // ===== NEW: Messages derived data =====
  const latestMessages = useMemo(() => {
    const list = [];
    filtered.forEach((u) => {
      const ms = u?.messagesSent || {};
      const tH = Array.isArray(ms?.text?.history) ? ms.text.history : [];
      const eH = Array.isArray(ms?.email?.history) ? ms.email.history : [];

      for (const h of tH) {
        const at = asDate(h?.at);
        if (at) {
          list.push({
            type: "text",
            at,
            forUserId: h?.forUserId,
            participantName: h?.participantName || "—",
            _ownerName: u.name || u.email || "—",
            _ownerEmail: u.email || "—",
          });
        }
      }
      for (const h of eH) {
        const at = asDate(h?.at);
        if (at) {
          list.push({
            type: "email",
            at,
            forUserId: h?.forUserId,
            participantName: h?.participantName || "—",
            _ownerName: u.name || u.email || "—",
            _ownerEmail: u.email || "—",
          });
        }
      }
    });

    return list.sort((a, b) => b.at - a.at).slice(0, 12);
  }, [filtered]);

  const messagesByUser = useMemo(() => {
    return filtered
      .map((u) => {
        const ms = u?.messagesSent || {};
        const t = ms.text || {};
        const e = ms.email || {};
        return {
          user: u,
          textTotal: Number(t.total || 0),
          emailTotal: Number(e.total || 0),
          text7d: countHistoryWithinDays(t.history, 7),
          email7d: countHistoryWithinDays(e.history, 7),
          lastMessageAt: (() => {
            const lastT = (t.history || [])
              .map((h) => asDate(h?.at))
              .filter(Boolean)
              .sort((a, b) => b - a)[0];
            const lastE = (e.history || [])
              .map((h) => asDate(h?.at))
              .filter(Boolean)
              .sort((a, b) => b - a)[0];
            if (!lastT && !lastE) return null;
            if (!lastT) return lastE;
            if (!lastE) return lastT;
            return lastT > lastE ? lastT : lastE;
          })(),
        };
      })
      .sort(
        (a, b) => b.textTotal + b.emailTotal - (a.textTotal + a.emailTotal)
      );
  }, [filtered]);

  function getActivityStatus(lastActive) {
    if (!lastActive) {
      return {
        label: "inactive",
        color: "bg-red-100 text-red-700 border-red-300",
      };
    }
    const now = new Date();
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    if (diffDays < 7)
      return {
        label: "active",
        color: "bg-emerald-100 text-emerald-700 border-emerald-300",
      };
    if (diffDays < 14)
      return {
        label: "semi-active",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    if (diffDays < 30)
      return {
        label: "old",
        color: "bg-orange-100 text-orange-800 border-orange-300",
      };
    return {
      label: "inactive",
      color: "bg-red-100 text-red-700 border-red-300",
    };
  }

  // ===== Loading state =====
  useEffect(() => {
    if (data.length === 0) {
      setTimeout(() => {
        const el = document.querySelector(".details");
        if (el) el.style.opacity = 1;
      }, 2000);
    }
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen flex-col">
        <div>Loading...</div>
        <div className="details opacity-0 text-center transition-all text-gray-400">
          Or am I...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Users Overview
            </h1>
            <p className="text-sm text-gray-500">
              Search, filter, and explore user metrics at a glance.
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, plan…"
              className="h-10 w-64 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* KPI Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi
              title="Total Users"
              value={counts.total}
              sub={`${counts.new30d} joined last 30d`}
            />
            <Kpi
              title="New (7d)"
              value={counts.new7d}
              sub="Signups last 7 days"
            />
            <Kpi
              title="Active (24h)"
              value={counts.active24h}
              sub={`${counts.active7d} active 7d`}
            />
            <Kpi
              title="Total Requests"
              value={counts.totalRequests}
              sub="Across all users"
            />
          </div>
        </section>

        {/* NEW: Message KPI row */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi
              title="Texts Sent (Total)"
              value={counts.messages.textTotal}
              sub={`${counts.messages.text30d} in last 30d`}
            />
            <Kpi
              title="Emails Sent (Total)"
              value={counts.messages.emailTotal}
              sub={`${counts.messages.email30d} in last 30d`}
            />
            <Kpi
              title="Texts (24h)"
              value={counts.messages.text24h}
              sub={`${counts.messages.text7d} in last 7d`}
            />
            <Kpi
              title="Emails (24h)"
              value={counts.messages.email24h}
              sub={`${counts.messages.email7d} in last 7d`}
            />
          </div>
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Daily Signups (14d)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailySignups}
                  margin={{ left: 8, right: 8, top: 10 }}
                >
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [v, "Signups"]} />
                  <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Plan Breakdown">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                  >
                    {planPie.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          PLAN_COLORS[entry.name?.toLowerCase()] ||
                          PLAN_COLORS.unknown
                        }
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <span className="mr-4">
                Stripe Linked: <b>{counts.withStripe}</b>
              </span>
              <span>
                Plaid Enabled: <b>{counts.withPlaid}</b>
              </span>
            </div>
          </Card>

          <Card title="Active Users">
            <div className="flex items-center gap-2 mb-3">
              {[
                { k: "24h", label: "24h" },
                { k: "7d", label: "7 days" },
                { k: "30d", label: "30 days" },
              ].map((b) => (
                <button
                  key={b.k}
                  onClick={() => setActiveWindow(b.k)}
                  className={`px-3 py-1.5 text-sm rounded-lg border ${
                    activeWindow === b.k
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden bg-white">
              {activeUsersList.map((u, i) => (
                <li
                  key={i}
                  className="p-3 flex items-center justify-between gap-4"
                >
                  <UserCell
                    user={u}
                    subtitle={`Last active ${fmtRelative(
                      asDate(u.lastActive),
                      now
                    )}`}
                  />
                  <span className="text-xs text-gray-500">
                    {(u.plan || "—").toUpperCase()}
                  </span>
                </li>
              ))}
              {activeUsersList.length === 0 && (
                <EmptyRow text="No active users in this window." />
              )}
            </ul>
          </Card>
        </section>

        {/* New Users & Latest Requests */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="New Users (7d)">
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden bg-white">
              {newUsersList.map((u, i) => (
                <li
                  key={i}
                  className="p-3 flex items-center justify-between gap-4"
                >
                  <UserCell
                    user={u}
                    subtitle={`Joined ${fmtRelative(asDate(u.createdAt), now)}`}
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500 ml-auto">
                      {(u.plan || "—").toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {console.log(u.requests.length)}
                      {u.requests.length.toString().toUpperCase() == "0"
                        ? "—"
                        : `${u.requests.length
                            .toString()
                            .toUpperCase()} Requests
                        `}
                    </span>
                  </div>
                </li>
              ))}
              {newUsersList.length === 0 && (
                <EmptyRow text="No signups in the last 7 days." />
              )}
            </ul>
          </Card>

          <Card title="Latest Requests">
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden bg-white">
              {latestRequests.map((r, i) => (
                <li
                  key={i}
                  className="p-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.name || "—"}</div>
                    <div className="text-xs text-gray-500 truncate">
                      <div>
                        {r._ownerName} · {fmtRelative(asDate(r.createdAt), now)}{" "}
                        · ${Number(r.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs w-[55px] text-gray-500 uppercase">
                      {r.isRecurring ? r.frequency || "recurring" : "one-time"}
                    </span>

                    <span className="text-xs text-gray-500 uppercase">
                      {r?.participants && r.participants.length} Person
                    </span>
                  </div>
                </li>
              ))}
              {latestRequests.length === 0 && (
                <EmptyRow text="No recent requests." />
              )}
            </ul>
          </Card>
        </section>

        {/* NEW: Latest Messages */}
        <section>
          <Card title="Latest Messages">
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 overflow-hidden bg-white">
              {latestMessages.map((m, i) => (
                <li
                  key={i}
                  className="p-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {m.participantName}{" "}
                      <span className="text-xs uppercase ml-2 px-2 py-0.5 rounded-lg border border-gray-200 text-gray-600">
                        {m.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {m._ownerName} · {fmtRelative(m.at, now)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{fmtDate(m.at)}</div>
                </li>
              ))}
              {latestMessages.length === 0 && (
                <EmptyRow text="No recent messages." />
              )}
            </ul>
          </Card>
        </section>

        {/* Data Tables */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card title="Plaid-Enabled Users">
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Enabled On</Th>
                    <Th>Last Used</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersWithPlaid.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <Td>
                        <UserTiny user={u} />
                      </Td>
                      <Td>{u.email}</Td>
                      <Td>{fmtDate(asDate(u?.plaid?.enabledOn))}</Td>
                      <Td>{fmtDate(asDate(u?.plaid?.lastUsed))}</Td>
                    </tr>
                  ))}
                  {usersWithPlaid.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No users with Plaid enabled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Users With Stripe">
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Created</Th>
                    <Th>Requests</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersStripe.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <Td>
                        <UserTiny user={u} />
                      </Td>
                      <Td>{u.email}</Td>
                      <Td className="uppercase">{u.plan || "—"}</Td>
                      <Td>{fmtDate(asDate(u.createdAt))}</Td>
                      <Td>
                        {Array.isArray(u.requests)
                          ? u.requests.filter((r) => r && r._id && !r.$oid)
                              .length
                          : 0}
                      </Td>
                    </tr>
                  ))}
                  {usersStripe.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No users with Stripe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* All Requests Table */}
        <section>
          <Card title="All Requests">
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <Th>Name</Th>
                    <Th>Owner</Th>
                    <Th>Amount</Th>
                    <Th>Recurring</Th>
                    <Th>Participants</Th>
                    <Th>Created</Th>
                    <Th>Due Next</Th>
                    <Th>Last Sent</Th>
                    <Th>Total Owed</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allRequests.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <Td className="max-w-[240px] truncate">
                        {r.name || "—"}
                      </Td>
                      <Td className="max-w-[220px] truncate">
                        {r._ownerName}{" "}
                        <span className="text-xs text-gray-400">
                          ({r._ownerEmail})
                        </span>
                      </Td>
                      <Td>${Number(r.amount || 0).toFixed(2)}</Td>
                      <Td className="uppercase">
                        {r.isRecurring
                          ? r.frequency || "recurring"
                          : "one-time"}
                      </Td>
                      <Td>
                        {Array.isArray(r.participants)
                          ? r.participants.length
                          : 0}
                      </Td>
                      <Td>{fmtDate(asDate(r.createdAt))}</Td>
                      <Td>{fmtDate(asDate(r.nextDue))}</Td>
                      <Td>{fmtDate(asDate(r.lastSent))}</Td>
                      <Td>${Number(r.totalAmountOwed || 0).toFixed(2)}</Td>
                    </tr>
                  ))}
                  {allRequests.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* NEW: Messages by User */}
        <section>
          <Card title="Messages by User">
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Text Total</Th>
                    <Th>Email Total</Th>
                    <Th>Text (7d)</Th>
                    <Th>Email (7d)</Th>
                    <Th>Last Message</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {messagesByUser.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <Td>
                        <UserTiny user={row.user} />
                      </Td>
                      <Td className="max-w-[260px] truncate">
                        {row.user.email}
                      </Td>
                      <Td>{row.textTotal}</Td>
                      <Td>{row.emailTotal}</Td>
                      <Td>{row.text7d}</Td>
                      <Td>{row.email7d}</Td>
                      <Td>{fmtDate(row.lastMessageAt)}</Td>
                    </tr>
                  ))}
                  {messagesByUser.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-500">
                        No message data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* Master Users Table */}
        <section>
          <Card title="All Users">
            <div className="overflow-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Plan</Th>
                    <Th>Role</Th>
                    <Th>Active</Th>
                    <Th>Created</Th>
                    <Th>Last Active</Th>
                    <Th>Contacts</Th>
                    <Th>Requests</Th>
                    {/* NEW per-user quick message totals */}
                    <Th>Texts</Th>
                    <Th>Emails</Th>
                    <Th>Est. Cost</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u, i) => {
                    const ms = u?.messagesSent || {};
                    const tTotal = Number(ms?.text?.total || 0);
                    const eTotal = Number(ms?.email?.total || 0);
                    const averageTextCost = 0.0085;
                    const estCost = Number(tTotal * averageTextCost).toFixed(4);
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <Td>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={u?.OAuth?.google?.picture}
                              fallback={initials(u?.name)}
                            />
                            <div>
                              <div className="font-medium">{u.name || "—"}</div>
                              <div className="text-xs text-gray-500">
                                Google: {mask(u?.OAuth?.google?.sub, 6)}
                              </div>
                            </div>
                          </div>
                        </Td>
                        <Td>{u.email}</Td>
                        <Td className="uppercase">{u.plan || "—"}</Td>
                        <Td className="uppercase">{u.role || "—"}</Td>
                        <Td>
                          {(() => {
                            const status = getActivityStatus(
                              asDate(u.lastActive)
                            );
                            return (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium border ${status.color}`}
                              >
                                {status.label}
                              </span>
                            );
                          })()}
                        </Td>
                        <Td>{fmtDate(asDate(u.createdAt))}</Td>
                        <Td>{fmtDate(asDate(u.lastActive))}</Td>
                        <Td>
                          {Array.isArray(u.contacts) ? u.contacts.length : 0}
                        </Td>
                        <Td>
                          {Array.isArray(u.requests)
                            ? u.requests.filter((r) => r && r._id && !r.$oid)
                                .length
                            : 0}
                        </Td>
                        <Td>{tTotal}</Td>
                        <Td>{eTotal}</Td>
                        <Td>${estCost}</Td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="p-6 text-center text-gray-500"
                      >
                        No users match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <footer className="py-10 text-center text-xs text-gray-400">
          Splitify Admin · v1.2
        </footer>
      </main>
    </div>
  );
}

/* ===== Small building blocks ===== */
function Card({ title, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Kpi({ title, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-3xl font-semibold">
        {Number(value).toLocaleString()}
      </div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="text-left font-semibold text-xs uppercase tracking-wide px-4 py-2 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td className={`px-4 py-2 align-middle whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function Avatar({ src, fallback }) {
  return (
    <div className="h-9 w-9 rounded-full border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs text-gray-600 font-medium">{fallback}</span>
      )}
    </div>
  );
}

function UserCell({ user, subtitle }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar
        src={user?.OAuth?.google?.picture}
        fallback={initials(user?.name)}
      />
      <div className="min-w-0">
        <div className="font-medium truncate">{user?.name || "—"}</div>
        <div className="text-xs text-gray-500 truncate">{subtitle}</div>
      </div>
    </div>
  );
}

function UserTiny({ user }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar
        src={user?.OAuth?.google?.picture}
        fallback={initials(user?.name)}
      />
      <div className="min-w-0">
        <div className="font-medium truncate">{user?.name || "—"}</div>
      </div>
    </div>
  );
}

function EmptyRow({ text }) {
  return <div className="p-4 text-sm text-gray-500 text-center">{text}</div>;
}

/* ===== Utilities ===== */
function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "—";
  }
}

function fmtDay(d) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
  }).format(d);
}

function fmtRelative(d, now = new Date()) {
  if (!d) return "never";
  const ms = now - d;
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function initials(name) {
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
