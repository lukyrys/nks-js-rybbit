import { NksRybbitConfig, RybbitNativeAPI } from "./types";
import { log, warn } from "./logger";

/**
 * Detect if window.rybbit is already available (loaded via script tag).
 */
function detectExisting(): RybbitNativeAPI | null {
  if (
    typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).rybbit
  ) {
    const r = (window as unknown as Record<string, unknown>).rybbit as RybbitNativeAPI;
    if (typeof r.event === "function" && typeof r.pageview === "function") {
      log("Detected existing window.rybbit");
      return r;
    }
  }
  return null;
}

/**
 * Load Rybbit via script tag injection.
 */
function loadViaScript(config: NksRybbitConfig): Promise<RybbitNativeAPI> {
  return new Promise((resolve, reject) => {
    const timeout = config.loadTimeout ?? 5000;
    const host = config.host.replace(/\/$/, "");

    // Check if script already exists
    const existingScript = document.querySelector(
      `script[src*="${host}/api/script.js"]`
    );
    if (existingScript) {
      log("Rybbit script tag already present, waiting for initialization");
    } else {
      const script = document.createElement("script");
      script.src = `${host}/api/script.js`;
      script.async = true;
      script.defer = true;
      script.setAttribute("data-site-id", config.siteId);

      if (config.disableReplay) {
        script.setAttribute("data-disable-replay", "true");
      }

      script.onerror = () => {
        reject(new Error(`Failed to load Rybbit script from ${script.src}`));
      };

      document.head.appendChild(script);
      log(`Injected script tag: ${script.src}`);
    }

    // Poll for window.rybbit readiness
    const startTime = Date.now();
    const poll = setInterval(() => {
      const rybbit = detectExisting();
      if (rybbit) {
        clearInterval(poll);
        resolve(rybbit);
        return;
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(poll);
        reject(
          new Error(`Rybbit script did not initialize within ${timeout}ms`)
        );
      }
    }, 50);
  });
}

/**
 * Load Rybbit via SDK-style init (for @rybbit/js npm usage).
 * Expects the init method to exist on window.rybbit (via @rybbit/js default export).
 */
async function loadViaSdk(config: NksRybbitConfig): Promise<RybbitNativeAPI> {
  const existing = detectExisting();
  if (existing && typeof existing.init === "function") {
    const host = config.host.replace(/\/$/, "");
    await existing.init({
      analyticsHost: `${host}/api`,
      siteId: config.siteId,
      debug: config.debug,
    });
    return existing;
  }

  throw new Error(
    "SDK mode requires @rybbit/js to be imported. window.rybbit.init() not found."
  );
}

/**
 * Main loader - resolves the native Rybbit API based on config strategy.
 */
export async function loadRybbit(
  config: NksRybbitConfig
): Promise<RybbitNativeAPI> {
  const strategy = config.loadStrategy ?? "detect";
  log(`Load strategy: ${strategy}`);

  if (strategy === "detect") {
    const existing = detectExisting();
    if (existing) {
      log("Using pre-existing window.rybbit");
      return existing;
    }
    log("No existing window.rybbit, falling back to script injection");
    return loadViaScript(config);
  }

  if (strategy === "sdk") {
    return loadViaSdk(config);
  }

  // strategy === "script"
  const existing = detectExisting();
  if (existing) {
    warn(
      "window.rybbit already exists but strategy is 'script'. Using existing."
    );
    return existing;
  }
  return loadViaScript(config);
}
