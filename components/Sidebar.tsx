"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  {
    label: "Advisor",
    items: [
      { href: "/", label: "New profile", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg> },
      { href: "/advice", label: "My plan", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/ethics", label: "Ethics Lab", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="vic-sidebar">
      <div className="vic-logo-block">
        <div className="vic-logo-wordmark">VIC</div>
        <div className="vic-logo-sub">Investment Club · Robo Advisor</div>
      </div>

      {NAV.map((section) => (
        <div className="vic-nav-section" key={section.label}>
          <div className="vic-nav-label">{section.label}</div>
          {section.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`vic-nav-item${pathname === item.href ? " active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      <div className="vic-sidebar-bottom">
        <div className="vic-avatar">AI</div>
        <div style={{ fontSize: 12 }}>Powered by Claude</div>
      </div>
    </aside>
  );
}
