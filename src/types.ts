/**
 * Configuration for NksRybbit SDK initialization.
 */
export interface NksRybbitConfig {
  /** Rybbit instance URL (e.g. "https://demo.rybbit.com") */
  host: string;

  /** Site ID from Rybbit dashboard */
  siteId: string;

  /** Enable debug logging to console (default: false) */
  debug?: boolean;

  /** Dry-run mode - log events but don't send (default: false) */
  dryRun?: boolean;

  /** Disable session replay even if server enables it */
  disableReplay?: boolean;

  /**
   * Loading strategy for the Rybbit script:
   * - "script": load via <script> tag (default for traditional sites)
   * - "sdk": use @rybbit/js npm package init (for SPA/bundled apps)
   * - "detect": auto-detect if window.rybbit exists, fallback to script
   */
  loadStrategy?: "script" | "sdk" | "detect";

  /** Timeout in ms to wait for Rybbit to load (default: 5000) */
  loadTimeout?: number;

  /** Auto-identify user from server-rendered data (default: true) */
  autoIdentify?: boolean;

  /** CSS selector or data attribute for user identity element */
  identitySelector?: string;

  /** Listen to GTM dataLayer for events (default: false) */
  gtmBridge?: boolean;

  /** GTM event names to forward to Rybbit (if gtmBridge enabled) */
  gtmEvents?: string[];

  /** Global properties added to every event */
  globalProperties?: Record<string, PropertyValue>;
}

export type PropertyValue = string | number | boolean;

export interface EventProperties {
  [key: string]: PropertyValue | PropertyValue[];
}

export interface QueuedEvent {
  method: string;
  args: unknown[];
  timestamp: number;
}

export type EventCallback = (
  eventName: string,
  properties?: EventProperties
) => void;

export type ReadyCallback = () => void;

/** Rybbit native API shape (window.rybbit from script.js or @rybbit/js) */
export interface RybbitNativeAPI {
  init?: (config: {
    analyticsHost: string;
    siteId: string;
    debug?: boolean;
    skipPatterns?: string[];
    maskPatterns?: string[];
    debounceDuration?: number;
    replayPrivacyConfig?: Record<string, unknown>;
  }) => Promise<void>;
  pageview: (path?: string) => void;
  event: (name: string, properties?: EventProperties) => void;
  trackOutbound: (url: string, text?: string, target?: string) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  setTraits?: (traits: Record<string, unknown>) => void;
  clearUserId: () => void;
  getUserId: () => string | null;
  error?: (error: Error | ErrorEvent, context?: EventProperties) => void;
  startSessionReplay?: () => void;
  stopSessionReplay?: () => void;
  isSessionReplayActive?: () => boolean;
  onPageChange?: (
    callback: (path: string, previousPath: string) => void
  ) => () => void;
  cleanup?: () => void;
}

/** E-commerce item for purchase/cart events */
export interface EcommerceItem {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  category?: string;
  variant?: string;
  brand?: string;
}

/** Standard GA4-compatible event definitions for web/eshop */
export interface StandardEvents {
  login: { method?: string };
  sign_up: { method?: string };
  logout: Record<string, never>;
  purchase: {
    transaction_id: string;
    value: number;
    currency?: string;
    items?: EcommerceItem[];
  };
  add_to_cart: {
    item_id: string;
    item_name: string;
    price?: number;
    quantity?: number;
  };
  remove_from_cart: {
    item_id: string;
    item_name: string;
  };
  view_item: {
    item_id: string;
    item_name: string;
    category?: string;
    price?: number;
  };
  view_cart: {
    items_count?: number;
    value?: number;
    currency?: string;
  };
  begin_checkout: {
    value?: number;
    currency?: string;
    items_count?: number;
  };
  search: {
    search_term: string;
    results_count?: number;
  };
  share: {
    method?: string;
    content_type?: string;
    item_id?: string;
  };
  page_view: {
    page_title?: string;
    page_location?: string;
  };
  generate_lead: {
    source?: string;
    value?: number;
  };
  contact_form_submit: {
    form_id?: string;
    form_name?: string;
  };
  newsletter_subscribe: {
    source?: string;
  };
  file_download: {
    file_name: string;
    file_extension?: string;
  };
  click_cta: {
    button?: string;
    location?: string;
  };
  // Engagement events
  video_play: {
    video_id?: string;
    video_title?: string;
    duration?: number;
  };
  scroll_depth: {
    percent: number;
    page?: string;
  };
  // CMS events
  comment_submit: {
    page_id?: string;
    page_title?: string;
  };
  rating_submit: {
    item_id?: string;
    rating: number;
    max_rating?: number;
  };
  // Conversion events
  add_to_wishlist: {
    item_id: string;
    item_name: string;
    price?: number;
  };
  view_promotion: {
    promotion_id?: string;
    promotion_name?: string;
    location?: string;
  };
  select_promotion: {
    promotion_id?: string;
    promotion_name?: string;
  };
  refund: {
    transaction_id: string;
    value?: number;
    currency?: string;
  };
}
