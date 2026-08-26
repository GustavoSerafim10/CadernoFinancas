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
    console.error("Erro não tratado no Nightfolio:", erro, info.componentStack);
  }

  render() {
    if (this.state.erro) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: "#0A0A0F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ maxWidth: 480, padding: "0 24px", textAlign: "center", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22, marginBottom: 10, color: "#F4F4F8" }}>
              algo deu errado
            </div>
            <p style={{ color: "#9A99AE", fontSize: 14, marginBottom: 20 }}>
              Aconteceu um erro inesperado na tela. Seus dados continuam salvos no navegador — recarregue a página
              para tentar de novo.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1.5px solid #7C6CF6",
                background: "#7C6CF6",
                color: "#F4F4F8",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
