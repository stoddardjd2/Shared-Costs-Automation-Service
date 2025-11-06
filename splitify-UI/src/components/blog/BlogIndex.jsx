import React from "react";

const posts = [
  { slug: "getting-started", title: "Getting Started: Connect, Add, Request", date: "Jan 1, 2025" },
  { slug: "recurring-bills", title: "How to Split Recurring Bills", date: "Jan 8, 2025" },
  { slug: "automated-reminders", title: "Automated Reminders, Without the Awkwardness", date: "Jan 15, 2025" },
  { slug: "partial-payments", title: "Handling Partial Payments and Adjustments", date: "Jan 22, 2025" },
  { slug: "plaid-security", title: "How Splitify Uses Plaid for Secure Bank Connections", date: "Feb 1, 2025" },
  { slug: "stripe-payments", title: "Payments with Stripe: Safety, Speed, and Simplicity", date: "Feb 8, 2025" },
  { slug: "dynamic-splits", title: "Designing Dynamic Splits for Fairness", date: "Feb 15, 2025" },
  { slug: "roommates-utilities-case-study", title: "Case Study: Roommates Splitting Utilities in 60 Seconds", date: "Feb 22, 2025" },
  { slug: "best-apps-to-split-bills-2025", title: "Best Apps to Split Bills with Roommates (2025)", date: "Apr 5, 2025" },
];

export default function BlogIndex() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <p className="text-sm text-slate-500">Splitify Blog</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Insights, guides, and updates</h1>
        <p className="mt-2 text-slate-600">
          Practical tips for managing shared expenses, product updates, and deep dives on how Splitify works.
        </p>
      </header>

      <ul className="divide-y divide-slate-200 bg-white/60 backdrop-blur rounded-xl border border-slate-200">
        {posts.map((p) => (
          <li key={p.slug} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors">
            {/* Use <a> to trigger a full navigation to prerendered static HTML */}
            <a href={`/blog/${p.slug}/`} className="block">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
                <span className="text-sm text-slate-500 whitespace-nowrap">{p.date}</span>
              </div>
              <span className="mt-1 inline-flex items-center text-sm text-indigo-600">
                Read more
                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

