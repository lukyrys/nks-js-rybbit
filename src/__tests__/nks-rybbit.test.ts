import { describe, it, expect, vi, beforeEach } from "vitest";
import { NksRybbitSDK, resetInstance } from "../nks-rybbit";
import type { RybbitNativeAPI } from "../types";

function createMockRybbit(): RybbitNativeAPI {
  return {
    pageview: vi.fn(),
    event: vi.fn(),
    trackOutbound: vi.fn(),
    identify: vi.fn(),
    setTraits: vi.fn(),
    clearUserId: vi.fn(),
    getUserId: vi.fn(() => null),
    error: vi.fn(),
    startSessionReplay: vi.fn(),
    stopSessionReplay: vi.fn(),
    isSessionReplayActive: vi.fn(() => false),
    cleanup: vi.fn(),
    onPageChange: vi.fn(() => () => {}),
  };
}

describe("NksRybbitSDK", () => {
  let sdk: NksRybbitSDK;

  beforeEach(() => {
    // Destroy previous standalone instance (not managed by singleton)
    sdk?.destroy();
    resetInstance();
    sdk = new NksRybbitSDK();
    delete (window as Record<string, unknown>).rybbit;
  });

  describe("boot in dry-run mode", () => {
    it("initializes without network calls", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });
      expect(sdk.isReady()).toBe(true);
      expect(sdk.getState()).toBe("ready");
    });

    it("logs events in dry-run", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
        debug: true,
      });

      // Should not throw
      sdk.event("test_event", { key: "value" });
      sdk.pageview("/test");
      sdk.trackLogin("email");
    });
  });

  describe("event queuing before boot", () => {
    it("queues events called before boot", async () => {
      // Call event before boot
      sdk.event("early_event", { key: "val" });
      sdk.pageview("/early");

      expect(sdk.isReady()).toBe(false);

      // Now boot with dry-run
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      expect(sdk.isReady()).toBe(true);
      // Events should have been flushed (no error)
    });
  });

  describe("typed events", () => {
    it("trackPurchase sends correct properties", async () => {
      const mock = createMockRybbit();
      (window as Record<string, unknown>).rybbit = mock;

      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        loadStrategy: "detect",
        loadTimeout: 100,
      });

      sdk.trackPurchase({
        transactionId: "TX-001",
        value: 99.99,
        currency: "CZK",
      });

      expect(mock.event).toHaveBeenCalledWith(
        "purchase",
        expect.objectContaining({
          transaction_id: "TX-001",
          value: 99.99,
          currency: "CZK",
        })
      );
    });

    it("trackSearch sends correct properties", async () => {
      const mock = createMockRybbit();
      (window as Record<string, unknown>).rybbit = mock;

      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        loadStrategy: "detect",
        loadTimeout: 100,
      });

      sdk.trackSearch("boty", 42);

      expect(mock.event).toHaveBeenCalledWith(
        "search",
        expect.objectContaining({
          search_term: "boty",
          results_count: 42,
        })
      );
    });
  });

  describe("global properties", () => {
    it("merges global properties into events", async () => {
      const mock = createMockRybbit();
      (window as Record<string, unknown>).rybbit = mock;

      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        loadStrategy: "detect",
        loadTimeout: 100,
        globalProperties: { site: "nks-web", env: "prod" },
      });

      sdk.event("click_cta", { button: "hero" });

      expect(mock.event).toHaveBeenCalledWith("click_cta", {
        site: "nks-web",
        env: "prod",
        button: "hero",
      });
    });
  });

  describe("onReady callback", () => {
    it("fires immediately if already ready", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      const cb = vi.fn();
      sdk.onReady(cb);
      expect(cb).toHaveBeenCalledOnce();
    });

    it("fires when SDK becomes ready", async () => {
      const cb = vi.fn();
      sdk.onReady(cb);
      expect(cb).not.toHaveBeenCalled();

      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      expect(cb).toHaveBeenCalledOnce();
    });
  });

  describe("event listeners", () => {
    it("notifies listeners on events", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      const listener = vi.fn();
      sdk.onEvent(listener);

      sdk.event("click", { x: 100 });
      expect(listener).toHaveBeenCalledWith("click", { x: 100 });
    });

    it("unsubscribes correctly", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      const listener = vi.fn();
      const unsub = sdk.onEvent(listener);
      unsub();

      sdk.event("click");
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("destroy", () => {
    it("resets SDK state", async () => {
      await sdk.boot({
        host: "https://test.example.com",
        siteId: "test123",
        dryRun: true,
      });

      expect(sdk.isReady()).toBe(true);
      sdk.destroy();
      expect(sdk.isReady()).toBe(false);
      expect(sdk.getState()).toBe("idle");
    });
  });
});
