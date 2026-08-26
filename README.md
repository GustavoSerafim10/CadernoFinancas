# Nightfolio

Controle financeiro pessoal completo: lançamentos, contas/cartões, transações
recorrentes, metas por categoria, carteira de investimentos com rentabilidade,
apostas esportivas (com lucro/prejuízo entrando no saldo geral), insights
automáticos de gasto e um simulador de investimentos com o motor de cálculo
escrito em **Rust, compilado pra WebAssembly**. Design dark, estilo dashboard
SaaS premium.

**Stack**: React 18 + TypeScript (strict) + Vite 6 + Recharts + Framer Motion,
mais um módulo em **Rust → WebAssembly** pra simulação de juros compostos.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Isso funciona **sem precisar de Rust
instalado** — o `.wasm` do simulador já vem compilado e commitado no repo
(`public/wasm/nightfolio-engine.wasm`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
src/
  types/          tipos TypeScript compartilhados (Transacao, Conta, etc.)
  constants/      categorias, meses, páginas, tipos de investimento
  utils/          formatação, datas, cálculo de insights
  services/       persistência (hoje: localStorage)
  hooks/          useFinancas — toda a lógica de dados e ações do app
  components/     Nav, SeletorMes, ícones, tema de gráficos, estilos compartilhados
  pages/          Dashboard, Extrato, Investimentos, Apostas, Simulador, Metas
  wasm/           ponte TypeScript pro motor Rust (engine.ts)
  App.tsx         junta navegação + hook + página ativa
  main.tsx        ponto de entrada do React
wasm/
  nightfolio-engine/   crate Rust do simulador (compila pra wasm32-unknown-unknown)
scripts/
  copy-wasm.mjs   copia o .wasm compilado pra public/wasm
```

## O motor Rust/WebAssembly

O simulador de investimentos (juros compostos com aporte mensal) roda em
Rust, compilado direto pra `wasm32-unknown-unknown` — **sem wasm-pack e sem
wasm-bindgen**. Os exports são funções `extern "C"` escritas à mão
(`wasm/nightfolio-engine/src/lib.rs`), e o lado TypeScript
(`src/wasm/engine.ts`) instancia o módulo via `WebAssembly.instantiate` puro
e lê os resultados direto da memória linear do wasm com um `Float64Array`.

Por quê assim: `wasm-bindgen` depende de macros que compilam e rodam no
*host* durante o build — em máquinas com política de segurança restritiva
(bloqueio de `.exe` não assinados, por exemplo), isso trava. Uma crate sem
nenhuma dependência (`#![no_std]`, zero proc-macros) compila pro alvo wasm32
usando só o linker `rust-lld` que já vem embutido no toolchain do Rust,
sem tocar em nada do host.

Pra recompilar o motor depois de mexer em `lib.rs` (precisa de Rust +
target `wasm32-unknown-unknown` instalados):

```bash
rustup target add wasm32-unknown-unknown   # uma vez só
npm run build:wasm
```

Isso compila a crate e já copia o `.wasm` pra `public/wasm/`. **Importante**:
`npm run build`/`npm run dev` não rodam esse passo automaticamente — o
`.wasm` fica commitado no repo pra rodar o projeto inteiro sem precisar de
Rust instalado. Se mexer no `lib.rs`, lembre de rodar `build:wasm` de novo
antes de commitar.

## Persistência

Os dados ficam salvos no `localStorage` do navegador (arquivo
`src/services/storage.ts`). Isso significa:

- os dados **não sincronizam** entre computador e celular, por exemplo;
- limpar os dados do navegador apaga o histórico;
- é fácil trocar por um backend de verdade depois — toda a persistência
  passa só por `getItem`/`setItem` desse arquivo, então dá pra reescrever
  só ele (Supabase, uma API própria, IndexedDB etc.) sem tocar no resto
  do app.

Use os botões de exportar (CSV do mês / JSON completo) no Dashboard para
fazer backup manual enquanto isso.

## Próximos passos possíveis

- autenticação + backend para acessar os dados em qualquer dispositivo
- importação de extrato bancário (CSV/OFX)
- app mobile ou PWA
