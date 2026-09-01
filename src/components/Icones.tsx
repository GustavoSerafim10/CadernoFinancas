export function IconeSeta({ dir = "left" }: { dir?: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={dir === "left" ? "M10 3L5 8L10 13" : "M6 3L11 8L6 13"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeX() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconeEditar() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M8.5 2L11 4.5L4.5 11H2V8.5L8.5 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconeDashboard() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="2.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.5" y="10.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconeExtrato() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <rect x="3.5" y="2" width="12" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 6.5H12.5M6.5 9.5H12.5M6.5 12.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconeInvestimentos() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <path d="M3 14L7.5 9L11 12L16 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5H16V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconeApostas() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <rect x="3" y="3" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="7" r="1.1" fill="currentColor" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <circle cx="7" cy="12" r="1.1" fill="currentColor" />
      <circle cx="12" cy="7" r="1.1" fill="currentColor" />
      <circle cx="9.5" cy="9.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconeSimulador() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <rect x="4" y="2.5" width="11" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 5.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6.8" cy="9" r="0.9" fill="currentColor" />
      <circle cx="9.5" cy="9" r="0.9" fill="currentColor" />
      <circle cx="12.2" cy="9" r="0.9" fill="currentColor" />
      <circle cx="6.8" cy="12" r="0.9" fill="currentColor" />
      <circle cx="9.5" cy="12" r="0.9" fill="currentColor" />
      <circle cx="12.2" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconeMetas() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
      <circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9.5" cy="9.5" r="3.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9.5" cy="9.5" r="0.9" fill="currentColor" />
    </svg>
  );
}
