import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  erro: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error("Erro não tratado no Caderno Financeiro:", erro, info.componentStack);
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, marginBottom: 10 }}>
            algo deu errado
          </div>
          <p style={{ color: "#5C6B78", fontSize: 14, marginBottom: 20 }}>
            Aconteceu um erro inesperado na tela. Seus dados continuam salvos no navegador — recarregue a página
            para tentar de novo.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 18px",
              borderRadius: 5,
              border: "1.5px solid #20303F",
              background: "#20303F",
              color: "#EDE6D4",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
