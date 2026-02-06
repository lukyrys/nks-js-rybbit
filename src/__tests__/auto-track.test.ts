import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NksRybbitSDK, resetInstance } from "../nks-rybbit";

describe("Auto-track", () => {
  let sdk: NksRybbitSDK;

  beforeEach(() => {
    resetInstance();
    sdk = new NksRybbitSDK();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    sdk.destroy();
  });

  async function bootWithAutoTrack() {
    await sdk.boot({
      host: "https://test.example.com",
      siteId: "test123",
      dryRun: true,
      autoTrack: true,
      autoIdentify: false,
    });
  }

  it("tracks click on element with data-nh-rybbit-event", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.setAttribute("data-nh-rybbit-event", "click_cta");
    document.body.appendChild(btn);

    btn.click();

    expect(spy).toHaveBeenCalledWith("click_cta", undefined);
  });

  it("extracts additional properties from data-nh-rybbit-* attributes", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.setAttribute("data-nh-rybbit-event", "click_cta");
    btn.setAttribute("data-nh-rybbit-button", "buy_now");
    btn.setAttribute("data-nh-rybbit-location", "hero");
    document.body.appendChild(btn);

    btn.click();

    expect(spy).toHaveBeenCalledWith("click_cta", {
      button: "buy_now",
      location: "hero",
    });
  });

  it("converts kebab-case attributes to snake_case keys", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.setAttribute("data-nh-rybbit-event", "test");
    btn.setAttribute("data-nh-rybbit-button-type", "primary");
    document.body.appendChild(btn);

    btn.click();

    expect(spy).toHaveBeenCalledWith("test", { button_type: "primary" });
  });

  it("tracks click on child element via event delegation", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const div = document.createElement("div");
    div.setAttribute("data-nh-rybbit-event", "banner_click");
    div.setAttribute("data-nh-rybbit-banner", "top");
    const span = document.createElement("span");
    span.textContent = "Click me";
    div.appendChild(span);
    document.body.appendChild(div);

    span.click();

    expect(spy).toHaveBeenCalledWith("banner_click", { banner: "top" });
  });

  it("does not track elements without data-nh-rybbit-event", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.textContent = "Regular button";
    document.body.appendChild(btn);

    btn.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it("does not track when autoTrack is false", async () => {
    await sdk.boot({
      host: "https://test.example.com",
      siteId: "test123",
      dryRun: true,
      autoIdentify: false,
    });
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.setAttribute("data-nh-rybbit-event", "click_cta");
    document.body.appendChild(btn);

    btn.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it("stops tracking after destroy()", async () => {
    await bootWithAutoTrack();
    const spy = vi.spyOn(sdk, "event");

    const btn = document.createElement("button");
    btn.setAttribute("data-nh-rybbit-event", "click_cta");
    document.body.appendChild(btn);

    sdk.destroy();
    btn.click();

    expect(spy).not.toHaveBeenCalled();
  });
});
