import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock TanStack Router primitives used by the gate
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, search, children, ...rest }: any) => {
    const qs = search ? `?${new URLSearchParams(search as Record<string, string>).toString()}` : "";
    return (
      <a href={`${to}${qs}`} {...rest}>
        {children}
      </a>
    );
  },
}));

import { LockedListingGate } from "@/components/LockedListingGate";

const sampleListing = {
  id: "l1",
  title: "Chevrolet Opala 1979",
  city: "São Paulo",
  state: "SP",
  photos: ["https://example.com/p.jpg"],
};

describe("LockedListingGate (tela de acesso bloqueado)", () => {
  it("aparece imediatamente para visitantes não logados, com título e benefícios", () => {
    render(<LockedListingGate listing={sampleListing} onBack={() => {}} />);
    expect(screen.getByText("Acesso bloqueado")).toBeInTheDocument();
    expect(screen.getByText(/Galeria completa/i)).toBeInTheDocument();
    expect(screen.getByText(/Contato direto/i)).toBeInTheDocument();
  });

  it("link 'Ver detalhes após entrar' aponta para /login com ?redirect=/anuncios/{id}", () => {
    render(<LockedListingGate listing={sampleListing} onBack={() => {}} />);
    const link = screen.getByTestId("gate-login-link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/login?redirect=%2Fanuncios%2Fl1");
  });

  it("link 'Criar conta grátis' aponta para /cadastro com o mesmo redirect", () => {
    render(<LockedListingGate listing={sampleListing} onBack={() => {}} />);
    const link = screen.getByTestId("gate-signup-link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/cadastro?redirect=%2Fanuncios%2Fl1");
  });

  it("botão 'Voltar para a busca' dispara onBack", async () => {
    const onBack = vi.fn();
    render(<LockedListingGate listing={sampleListing} onBack={onBack} />);
    await userEvent.click(screen.getByTestId("gate-back-button"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("o redirect-to fica exposto no DOM e corresponde ao id do anúncio", () => {
    render(<LockedListingGate listing={sampleListing} onBack={() => {}} />);
    const gate = screen.getByTestId("locked-listing-gate");
    expect(gate.getAttribute("data-redirect-to")).toBe("/anuncios/l1");
  });
});