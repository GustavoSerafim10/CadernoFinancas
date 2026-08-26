# Caderno Financeiro

Controle financeiro pessoal completo: lançamentos, contas/cartões, transações
recorrentes, metas por categoria, carteira de investimentos com rentabilidade,
apostas esportivas (com lucro/prejuízo entrando no saldo geral) e insights
automáticos de gasto. Interface com identidade visual própria, inspirada em
um caderno de anotações.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

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
  components/     Nav, SeletorMes, ícones, estilos compartilhados
  pages/          Dashboard, Extrato, Investimentos, Apostas, Metas
  App.tsx         junta navegação + hook + página ativa
  main.tsx        ponto de entrada do React
```

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
