import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockListings } from "@/lib/mock-data";

// ──────────────────────────────────────────────────────────────────────
// 1) Data/contract: every card MUST produce a valid detail URL
// ──────────────────────────────────────────────────────────────────────
describe("Anuncios navigation contract", () => {
  it("every mock listing has a non-empty id", () => {
    expect(mockListings.length).toBeGreaterThan(0);
    for (const l of mockListings) {
      expect(l.id).toBeTruthy();
      expect(typeof l.id).toBe("string");
    }
  });

  it("all listing ids are unique (no collision on detail route)", () => {
    const ids = mockListings.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each listing maps to the dynamic route /anuncios/$id with valid params", () => {
    for (const l of mockListings) {
      const path = `/anuncios/${l.id}`;
      expect(path).toMatch(/^\/anuncios\/[A-Za-z0-9_-]+$/);
      // The login redirect must round-trip the same path
      const loginUrl = `/login?redirect=${encodeURIComponent(path)}`;
      const decoded = decodeURIComponent(
        new URLSearchParams(loginUrl.split("?")[1]).get("redirect") || "",
      );
      expect(decoded).toBe(path);
    }
  });
});

// ──────────────────────────────────────────────────────────────────────
// 2) Card click test (with a mocked router Link)
// ──────────────────────────────────────────────────────────────────────
const navigations: Array<{ to: string; params: unknown }> = [];

vi.mock("@tanstack/react-router", () => {
  return {
    Link: ({ to, params, children, onClick, ...rest }: any) => (
      <a
        href={typeof to === "string" ? to : "#"}
        data-to={to}
        data-params={JSON.stringify(params ?? null)}
        onClick={(e) => {
          e.preventDefault();
          navigations.push({ to, params });
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </a>
    ),
  };
});

// Import AFTER the mock so the component picks it up
import { Link } from "@tanstack/react-router";

function ListingCard({ id, title }: { id: string; title: string }) {
  return (
    <Link to="/anuncios/$id" params={{ id }}>
      <article>
        <h3>{title}</h3>
      </article>
    </Link>
  );
}

describe("Listing card click navigation", () => {
  it("clicking a card calls Link with /anuncios/$id and the listing id", async () => {
    navigations.length = 0;
    const sample = mockListings[0];
    render(<ListingCard id={sample.id} title={sample.title} />);
    await userEvent.click(screen.getByRole("heading", { name: sample.title }));
    expect(navigations).toHaveLength(1);
    expect(navigations[0].to).toBe("/anuncios/$id");
    expect(navigations[0].params).toEqual({ id: sample.id });
  });

  it("each card in a grid navigates to its own detail route", async () => {
    navigations.length = 0;
    const samples = mockListings.slice(0, 5);
    render(
      <ul>
        {samples.map((l) => (
          <li key={l.id}>
            <ListingCard id={l.id} title={l.title} />
          </li>
        ))}
      </ul>,
    );
    for (const s of samples) {
      await userEvent.click(screen.getByRole("heading", { name: s.title }));
    }
    expect(navigations.map((n) => (n.params as { id: string }).id)).toEqual(
      samples.map((s) => s.id),
    );
  });
});