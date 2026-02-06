# Getting Started

This guide will help you install, configure, and start using the `@nks-hub/rybbit` SDK—a TypeScript wrapper for Rybbit Analytics. You'll learn how to integrate privacy-first, cookieless analytics into your web application with minimal effort.

> **Note:** Rybbit is a privacy-first analytics platform that doesn't use cookies. No cookie consent management required.

---

## Installation

Install the SDK via npm:

```bash
npm install @nks-hub/rybbit
```

Alternatively, you can use the IIFE bundle directly via a script tag for non-bundled environments.

---

## Basic Configuration

Import and initialize the SDK with your Rybbit instance details:

```typescript
import nksRybbit from '@nks-hub/rybbit';

await nksRybbit.boot({
  // Required
  host: 'https://demo.rybbit.com',   // Your Rybbit instance URL
  siteId: 'your-site-id',           // Site ID from Rybbit dashboard

  // Optional
  debug: false,                      // Enable console logging
  dryRun: false,                     // Log events without sending them
  disableReplay: false,              // Disable session replay feature
  loadStrategy: 'detect',            // 'script' | 'sdk' | 'detect'
  loadTimeout: 5000,                 // Timeout in milliseconds
  autoIdentify: true,                // Auto-identify users from DOM
  identitySelector: '[data-nh-rybbit-user-id]',
  autoTrack: false,                    // Auto-track clicks on data-nh-rybbit-event elements
  globalProperties: {                // Properties added to every event
    site: 'my-site',
    env: 'production'
  },
  gtmBridge: false,                  // Forward Google Tag Manager events
  gtmEvents: ['purchase', 'login'],  // Filter which GTM events to forward
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | `string` | **Required** | Your Rybbit instance URL |
| `siteId` | `string` | **Required** | Site identifier from Rybbit dashboard |
| `debug` | `boolean` | `false` | Enable verbose console logging |
| `dryRun` | `boolean` | `false` | Log events without sending to server |
| `disableReplay` | `boolean` | `false` | Disable session replay functionality |
| `loadStrategy` | `'detect' \| 'script' \| 'sdk'` | `'detect'` | How to load Rybbit core (see below) |
| `loadTimeout` | `number` | `5000` | Maximum time to wait for SDK load (ms) |
| `autoIdentify` | `boolean` | `true` | Automatically identify users from DOM |
| `identitySelector` | `string` | `'[data-nh-rybbit-user-id]'` | CSS selector for user identity element |
| `autoTrack` | `boolean` | `false` | Auto-track clicks on `data-nh-rybbit-event` elements |
| `globalProperties` | `object` | `{}` | Properties included in every event |
| `gtmBridge` | `boolean` | `false` | Enable Google Tag Manager integration |
| `gtmEvents` | `string[]` | `[]` | Filter GTM events to forward to Rybbit |

---

## Loading Strategies

The SDK supports three loading strategies to accommodate different integration scenarios.

### `detect` (Default)

Automatically detects if `window.rybbit` already exists (e.g., loaded via script tag by another system). Falls back to script injection if not found.

**Best for:** Sites that might already have Rybbit loaded via GTM or server-rendered templates.

```typescript
await nksRybbit.boot({
  loadStrategy: 'detect',
  // ... other options
});
```

### `script`

Injects the Rybbit `<script>` tag into the page and polls for readiness.

**Best for:** Traditional multi-page websites without an existing Rybbit setup.

```typescript
await nksRybbit.boot({
  loadStrategy: 'script',
  // ... other options
});
```

### `sdk`

Uses the `@rybbit/js` npm package's `init()` method directly. Requires `@rybbit/js` to be installed and imported separately.

**Best for:** Single-page applications (SPAs) or bundled apps using npm.

```typescript
await nksRybbit.boot({
  loadStrategy: 'sdk',
  // ... other options
});
```

> **Tip:** If you're unsure which strategy to use, stick with `'detect'`—it handles most scenarios automatically.

---

## Event Queuing

Events called before `boot()` completes are automatically queued and replayed once the SDK is ready. This ensures no data is lost during initialization.

```typescript
const sdk = new NksRybbitSDK();

// These events are queued while the SDK initializes
sdk.event('early_click', { button: 'hero' });
sdk.pageview('/landing');

// Events are automatically replayed after boot completes
await sdk.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id'
});
```

> **Note:** Queued events fire in the order they were called, preserving the user journey timeline.

---

## Auto-Identify

By default, the SDK automatically identifies users by looking for a DOM element with the `data-nh-rybbit-user-id` attribute:

```html
<meta data-nh-rybbit-user-id="user@example.com">
```

The attribute value is passed to `rybbit.identify()` automatically on boot.

### Customizing the Selector

You can customize which element is used for auto-identification:

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  autoIdentify: true,
  identitySelector: '[data-user-email]', // Custom selector
});
```

### Disabling Auto-Identify

If you prefer manual user identification, disable this feature:

```typescript
await nksRybbit.boot({
  autoIdentify: false,
  // ... other options
});

// Manually identify users later
nksRybbit.identify('user@example.com');
```

---

## Auto-Track (DOM Click Tracking)

When `autoTrack: true`, the SDK automatically tracks clicks on any element with a `data-nh-rybbit-event` attribute. No JavaScript event listeners required.

### How It Works

Add `data-nh-rybbit-event` to set the event name, and any additional `data-nh-rybbit-*` attributes become event properties:

```html
<button data-nh-rybbit-event="click_cta" data-nh-rybbit-button="buy_now" data-nh-rybbit-location="hero">
  Buy Now
</button>
<!-- Click fires: event("click_cta", { button: "buy_now", location: "hero" }) -->
```

### Configuration

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  autoTrack: true,
});
```

### Attribute Convention

- `data-nh-rybbit-event` — event name (required, determines which elements are tracked)
- `data-nh-rybbit-*` — all other attributes become properties with the prefix stripped
- Kebab-case attributes are converted to snake_case: `data-nh-rybbit-button-type` → `button_type`

### Event Delegation

Uses a single delegated listener on `document`, so dynamically added elements are tracked automatically. Clicking a child element bubbles up to the nearest `[data-nh-rybbit-event]` ancestor.

---

## Global Properties

Global properties are automatically included with every event you send. This is useful for contextual data like environment, site name, or application version.

### Setting Global Properties

```typescript
nksRybbit.setGlobalProperty('site', 'my-shop');
nksRybbit.setGlobalProperty('env', 'production');

// All events now include site and env
nksRybbit.event('click', { button: 'buy' });
// Sent as: { site: 'my-shop', env: 'production', button: 'buy' }
```

### Removing Global Properties

```typescript
nksRybbit.removeGlobalProperty('env');
```

### Setting at Boot

You can also define global properties during initialization:

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  globalProperties: {
    site: 'my-site',
    env: 'production',
    version: '2.1.0',
  },
});
```

---

## Dry-Run Mode

Dry-run mode is perfect for development and testing. Events are logged to the console but **not sent** to the Rybbit server.

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'test',
  dryRun: true,
  debug: true,
});

nksRybbit.event('test', { action: 'button_click' });
// Console output: [NksRybbit] [DRY] event: test { action: 'button_click' }
```

> **Tip:** Combine `dryRun: true` with `debug: true` to see exactly what data would be sent without affecting production analytics.

---

## SDK Lifecycle

The SDK provides several methods to monitor and control its lifecycle.

### Check Readiness

```typescript
// Check if SDK is ready
if (nksRybbit.isReady()) {
  nksRybbit.event('user_action');
}

// Get current state
const state = nksRybbit.getState();
// Returns: 'idle' | 'booting' | 'ready' | 'failed'
```

### Ready Callback

Execute code when the SDK is ready:

```typescript
nksRybbit.onReady(() => {
  console.log('Rybbit SDK is ready to track events');
});
```

### Event Listeners

Listen to all events fired by the SDK:

```typescript
const unsubscribe = nksRybbit.onEvent((name, props) => {
  console.log('Event fired:', name, props);
});

// Unsubscribe when no longer needed
unsubscribe();
```

### Page Change Listener

For single-page applications, track route changes:

```typescript
const unsubscribe = nksRybbit.onPageChange((path, previousPath) => {
  console.log(`Navigated: ${previousPath} -> ${path}`);
});

// Unsubscribe when component unmounts
unsubscribe();
```

### Cleanup

Properly tear down the SDK when needed (e.g., during component unmount):

```typescript
nksRybbit.destroy();
```

> **Note:** Calling `destroy()` clears all event listeners and stops tracking. Use this when your application or component is unmounting.

---

## Next Steps

Now that you've configured the SDK, explore these guides:

- **[Events Reference](./events.md)** - Complete catalog of typed events with examples
- **[GTM Bridge](./gtm-bridge.md)** - Forward Google Tag Manager events to Rybbit
- **[API Reference](./api.md)** - Complete SDK method documentation
- **[Examples](./examples.md)** - Real-world integration examples

---

**Need help?** Open an issue on [GitHub](https://github.com/nks-hub/nks-js-rybbit/issues).
