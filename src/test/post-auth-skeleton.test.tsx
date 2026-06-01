import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { PostAuthSkeleton } from "@/components/PostAuthSkeleton";

describe("PostAuthSkeleton (loader após login/cadastro)", () => {
  it("renderiza o spinner, título e barras de skeleton", () => {
    render(<PostAuthSkeleton />);

    expect(screen.getByTestId("post-auth-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("post-auth-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("post-auth-bars")).toBeInTheDocument();
    expect(screen.getByText("Entrando…")).toBeInTheDocument();
  });

  it("mostra mensagem genérica quando não há redirect", () => {
    render(<PostAuthSkeleton subtitle="Preparando sua área." />);

    expect(
      screen.getByText("Preparando sua área.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/detalhes do anúncio/i)
    ).not.toBeInTheDocument();
  });

  it("mostra mensagem de redirect quando há caminho de retorno", () => {
    render(<PostAuthSkeleton redirect="/anuncios/l1" />);

    expect(
      screen.getByText("Carregando os detalhes do anúncio que você abriu.")
    ).toBeInTheDocument();
  });

  it("aceita título customizado", () => {
    render(<PostAuthSkeleton title="Criando sua conta…" />);

    expect(screen.getByText("Criando sua conta…")).toBeInTheDocument();
  });

  it("renderiza exatamente 3 barras de skeleton", () => {
    const { container } = render(<PostAuthSkeleton />);

    const bars = container.querySelectorAll("[data-testid='post-auth-bars'] > div");
    expect(bars.length).toBe(3);
    bars.forEach((bar) => {
      expect(bar.classList.contains("animate-pulse")).toBe(true);
    });
  });

  it("não renderiza nenhum conteúdo do anúncio (garantia de que é só loader)", () => {
    render(<PostAuthSkeleton redirect="/anuncios/l1" />);

    // Certifica que não há nenhum elemento que seria típico da página de detalhes
    expect(screen.queryByText(/Preço/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Especificações/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Contato/i)).not.toBeInTheDocument();
  });

  it("some do DOM quando o componente pai deixa de renderizá-lo (simula carregamento completo)", () => {
    const { unmount } = render(<PostAuthSkeleton redirect="/anuncios/l1" />);

    expect(screen.getByTestId("post-auth-skeleton")).toBeInTheDocument();

    unmount();

    expect(screen.queryByTestId("post-auth-skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-auth-spinner")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-auth-bars")).not.toBeInTheDocument();
  });
});
