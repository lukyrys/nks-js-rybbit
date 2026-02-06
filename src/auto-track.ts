import { log } from "./logger";
import type { NksRybbitSDK } from "./nks-rybbit";
import type { EventProperties } from "./types";

const ATTR_PREFIX = "data-nhr-";
const EVENT_ATTR = "data-nhr-event";
const SELECTOR = `[${EVENT_ATTR}]`;

let clickHandler: ((e: Event) => void) | null = null;

/**
 * Convert kebab-case attribute name to snake_case property key.
 * e.g. "data-nhr-button-type" → "button_type"
 */
function attrToKey(attr: string): string {
  return attr.slice(ATTR_PREFIX.length).replace(/-/g, "_");
}

/**
 * Extract event name and properties from a tracked element.
 */
function extractProps(el: Element): { name: string; props: EventProperties } | null {
  const name = el.getAttribute(EVENT_ATTR);
  if (!name) return null;

  const props: EventProperties = {};
  for (const attr of el.attributes) {
    if (attr.name.startsWith(ATTR_PREFIX) && attr.name !== EVENT_ATTR) {
      props[attrToKey(attr.name)] = attr.value;
    }
  }

  return { name, props: Object.keys(props).length > 0 ? props : {} };
}

/**
 * Attach a delegated click listener on document for auto-tracking.
 */
export function setupAutoTrack(sdk: NksRybbitSDK): void {
  if (typeof document === "undefined") return;
  if (clickHandler) return;

  clickHandler = (e: Event) => {
    const target = e.target as Element | null;
    if (!target) return;

    const tracked = target.closest(SELECTOR);
    if (!tracked) return;

    const data = extractProps(tracked);
    if (!data) return;

    const hasProps = Object.keys(data.props).length > 0;
    sdk.event(data.name, hasProps ? data.props : undefined);
    log(`Auto-track click: ${data.name}`, hasProps ? data.props : undefined);
  };

  document.addEventListener("click", clickHandler, true);
  log("Auto-track enabled");
}

/**
 * Remove the delegated click listener.
 */
export function teardownAutoTrack(): void {
  if (clickHandler) {
    document.removeEventListener("click", clickHandler, true);
    clickHandler = null;
    log("Auto-track disabled");
  }
}
