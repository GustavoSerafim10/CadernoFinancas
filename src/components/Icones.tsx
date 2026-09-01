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

export function IconeCarteira() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5.5C3 4.67 3.67 4 4.5 4H13a1 1 0 0 1 1 1v1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2.5" y="6" width="13" height="8.5" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12.2" cy="10.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconeCartao() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="4" width="14" height="10" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7.5H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 11.2H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconeSaldo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 6v6M11 7.3c0-.9-.9-1.5-2-1.5s-2 .6-2 1.4c0 .9.9 1.2 2 1.4s2 .5 2 1.4c0 .8-.9 1.4-2 1.4s-2-.6-2-1.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconeDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1.5V8.5M6.5 8.5L3.5 5.5M6.5 8.5L9.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 10.5V11.2C2 11.6 2.35 12 2.8 12H10.2C10.65 12 11 11.6 11 11.2V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconeCalendario() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="3" width="10" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6H12" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 1.5V3.5M9.5 1.5V3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
