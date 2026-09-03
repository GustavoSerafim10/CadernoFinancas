import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "/CadernoFinancas/" só faz sentido pra build de produção servida via
// GitHub Pages (repositório de projeto, não usuário/organização nem domínio
// próprio) — em dev o servidor local continua servindo da raiz.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/CadernoFinancas/" : "/",
  server: {
    port: 5173,
    strictPort: true,
  },
}));
