# Nightfolio

Dashboard financeiro pessoal completo: lançamentos, contas/cartões,
transações recorrentes, metas por categoria, carteira de investimentos com
rentabilidade, operações de apostas esportivas (lucro/prejuízo entrando no
saldo geral), um score de **saúde financeira** calculado a partir dos seus
próprios dados, uma página de **insights automáticos** (regras matemáticas,
sem IA) e um simulador de investimentos com o motor de cálculo escrito em
**Rust, compilado pra WebAssembly**. Design dark, estilo dashboard SaaS/BI
premium — responsivo (desktop → mobile) e acessível (WCAG 2.0/2.1 A+AA).

**Stack**: React 18 + TypeScript (strict) + Vite 6 + Recharts + Framer Motion,
mais um módulo em **Rust → WebAssembly** pra simulação de juros compostos.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` (porta fixa — veja a nota abaixo). Isso
funciona **sem precisar de Rust instalado** — o `.wasm` do simulador já vem
compilado e commitado no repo (`public/wasm/nightfolio-engine.wasm`).

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

> A build de produção usa `base: "/CadernoFinancas/"` (necessário pro
> GitHub Pages, que serve o site num subcaminho) — então o `npm run
> preview` abre em `http://localhost:4173/CadernoFinancas/`, não na raiz.
> Em `npm run dev` isso não se aplica, continua servindo da raiz normal.

## Deploy

O site fica publicado em **https://gustavoserafim10.github.io/CadernoFinancas/**
via GitHub Pages, com deploy automático a cada push na `main`
(`.github/workflows/deploy.yml`): builda com `npm run build` e publica o
`dist/` gerado. Não precisa de nenhum serviço/conta externa — usa só o
GitHub Actions do próprio repositório.

> **Por que a porta é fixa (`strictPort: true` no `vite.config.ts`)**: os
> dados ficam em `localStorage`, que é isolado por origem (protocolo + host
> + porta). Se o Vite subisse em portas diferentes em dias diferentes (o
> padrão quando a porta preferida já está ocupada), o navegador enxergaria
> cada porta como um site separado e o histórico "sumiria". Com a porta
> travada, `npm run dev` falha alto (em vez de trocar de porta em silêncio)
> se `5173` já estiver em uso — sinal pra fechar o processo que já está
> rodando ali antes de continuar.

## Estrutura de pastas

```
src/
  types/          tipos TypeScript compartilhados (Transacao, Conta, etc.)
  constants/      categorias, meses, páginas, tipos de investimento
  utils/          formatação, datas, insights automáticos, score de saúde
                  financeira
  services/       persistência (hoje: localStorage)
  hooks/          useFinancas — toda a lógica de dados e ações do app
  components/     Sidebar, TopTabs, SeletorMes, ícones, cards (KPI, Saúde
                  Financeira), tema de gráficos, estilos compartilhados
  pages/          Dashboard, Extrato, Investimentos, Apostas, Simulador,
                  Metas, Insights
  wasm/           ponte TypeScript pro motor Rust (engine.ts)
  App.tsx         junta navegação + hook + página ativa
  main.tsx        ponto de entrada do React
wasm/
  nightfolio-engine/   crate Rust do simulador (compila pra wasm32-unknown-unknown)
scripts/
  copy-wasm.mjs   copia o .wasm compilado pra public/wasm
```

## Páginas

- **Dashboard** — visão geral do mês: KPIs com tendência vs. mês anterior,
  card de Saúde Financeira (score 0–100), Fluxo de Caixa como gráfico
  principal, evolução do saldo acumulado, distribuição por categoria e
  últimos lançamentos.
- **Extrato** — lançar receitas/gastos/investimentos, recorrências, contas.
- **Investimentos** — carteira com rentabilidade por posição e por tipo.
- **Operações** — apostas esportivas: registra, resolve (ganhou/perdeu) e o
  resultado líquido entra automaticamente no saldo do mês.
- **Simulador** — projeção de juros compostos, calculada em Rust/WASM.
- **Metas** — limite de gasto por categoria, com progresso.
- **Insights** — leituras automáticas do mês (variação de gastos, taxa de
  poupança, categoria que mais pesa, proximidade do orçamento, projeção de
  reserva), geradas por regras determinísticas sobre os próprios dados —
  sem depender de IA.

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

## Responsividade

O layout se adapta em duas faixas de largura:

- **≤ 1100px**: os grids de 3 colunas do Dashboard passam pra 2.
- **≤ 720px**: grids colapsam pra 1 coluna, a sidebar lateral vira uma barra
  fixa inferior (padrão de navegação mobile), a lista de abas do topo ganha
  scroll horizontal em vez de estourar a tela, e os botões de editar/remover
  das listas — que no desktop só aparecem no `:hover` — ficam sempre
  visíveis (`@media (hover: none)`, já que touchscreen não tem hover de
  verdade).

## Acessibilidade

Auditado com [axe-core](https://github.com/dequelabs/axe-core) (regras
`wcag2a` + `wcag2aa`) nas 7 páginas — **0 violações**. Alguns dos pontos
corrigidos:

- Contraste de cor: `--text-muted` e o botão primário foram ajustados pra
  passar do mínimo de 4.5:1 exigido pra texto normal.
- Todo input que dependia só de `placeholder` (que some ao digitar e nem
  todo leitor de tela anuncia de forma confiável) ganhou `aria-label` ou um
  `<label htmlFor>` associado de verdade.
- Títulos de painel viraram `<h2>` de verdade, pra navegação por cabeçalho.
- Gráficos sem tabela/legenda equivalente ao lado (Fluxo de Caixa, Evolução
  do Saldo, projeção do Simulador) ganharam `role="img"` + `aria-label`
  resumindo o gráfico em texto; os donuts (que o Recharts renderiza com
  `<title>`/`<desc>` vazios, contando como nome acessível "vazio" pra
  leitor de tela) ficam com o `<svg>` interno marcado `aria-hidden`,
  deixando só o resumo em texto do wrapper.
- Ícones puramente decorativos (menu "•••", sino/avatar do header) ganharam
  `aria-hidden`, pra não gerar ruído em quem navega por leitor de tela.

## Persistência

Os dados ficam salvos no `localStorage` do navegador (arquivo
`src/services/storage.ts`). Isso significa:

- os dados **não sincronizam** entre computador e celular, por exemplo, nem
  entre navegadores/portas diferentes no mesmo computador (veja a nota
  sobre porta fixa acima);
- se o app abrir e não encontrar nenhum dado salvo, ele avisa na tela em
  vez de deixar parecer que os dados "sumiram" silenciosamente;
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
- Insights com interpretação por IA em cima das mesmas regras já calculadas
- app mobile ou PWA
