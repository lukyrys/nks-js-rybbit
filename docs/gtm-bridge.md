# GTM Bridge

**Automatic Google Tag Manager integration for Rybbit Analytics**

---

## Overview

The GTM Bridge automatically intercepts and forwards Google Tag Manager `dataLayer.push()` calls to Rybbit Analytics. This eliminates the need to create individual Custom HTML tags in GTM for every event you want to track.

### The Problem

Without GTM Bridge, tracking events in both GTM and Rybbit requires:
- Separate Custom HTML tags in GTM for each event type
- Manual configuration and maintenance of tag triggers
- Duplicate event tracking logic across systems

### The Solution

Enable GTM Bridge once, and all your existing `dataLayer.push()` calls are automatically forwarded to Rybbit—no additional GTM configuration required.

---

## Quick Start

### Basic Setup

Enable automatic forwarding of all events:

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  gtmBridge: true
});
```

### Selective Event Forwarding

Forward only specific events:

```typescript
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  gtmBridge: true,
  gtmEvents: ['purchase', 'add_to_cart', 'login', 'sign_up']
});
```

---

## How It Works

The GTM Bridge operates through a transparent interception mechanism:

**Step 1: Method Interception**
The bridge wraps the native `dataLayer.push()` method when Rybbit boots.

**Step 2: Event Inspection**
Each push operation is inspected for an `event` property that identifies the event type.

**Step 3: Internal Event Filtering**
GTM-specific internal events are automatically filtered out (e.g., `gtm.js`, `gtm.dom`, `gtag.config`, `optimize.activate`).

**Step 4: Custom Event Filtering** (optional)
If the `gtmEvents` configuration option is specified, only events matching the whitelist are forwarded.

**Step 5: Property Extraction**
Event properties are extracted, with GTM-specific metadata removed (e.g., `eventCallback`, `eventTimeout`, `gtm.*` properties).

**Step 6: Rybbit Forwarding**
The clean event and properties are sent to Rybbit via `rybbit.event(name, properties)`.

> **Note:** The original `dataLayer.push()` call continues to GTM unchanged. The bridge operates as a passive listener.

---

## Before & After Comparison

### Before: Manual GTM Tag Setup

**Your code:**
```javascript
dataLayer.push({
  event: 'purchase',
  transaction_id: 'ORD-12345',
  value: 1299.99,
  currency: 'CZK',
  items: ['item-1', 'item-2']
});
```

**Required GTM configuration:**
- Create Custom HTML tag for "purchase" event
- Configure tag trigger
- Add Rybbit tracking code to tag
- Repeat for every event type

---

### After: GTM Bridge Enabled

**Your code:**
```javascript
// Same dataLayer.push() as before
dataLayer.push({
  event: 'purchase',
  transaction_id: 'ORD-12345',
  value: 1299.99,
  currency: 'CZK',
  items: ['item-1', 'item-2']
});
```

**Automatically forwarded to Rybbit:**
```javascript
rybbit.event('purchase', {
  transaction_id: 'ORD-12345',
  value: 1299.99,
  currency: 'CZK',
  items: ['item-1', 'item-2']
});
```

**GTM configuration:**
- None required

---

## Configuration Options

### `gtmBridge`

**Type:** `boolean`
**Default:** `false`

Enables or disables the GTM Bridge.

```typescript
gtmBridge: true  // Enable automatic event forwarding
```

---

### `gtmEvents`

**Type:** `string[]` (optional)
**Default:** `undefined` (forward all non-internal events)

Whitelist of event names to forward. When specified, only events matching these names are sent to Rybbit.

**Example: Forward all events**
```typescript
gtmBridge: true
// All non-internal dataLayer events are forwarded
```

**Example: Forward specific events only**
```typescript
gtmBridge: true,
gtmEvents: ['purchase', 'add_to_cart', 'login', 'sign_up', 'checkout_started']
```

> **Tip:** Use `gtmEvents` to avoid sending unnecessary events to Rybbit, reducing data noise and improving analytics clarity.

---

## Automatic Filtering

### Ignored Events

The following GTM internal events are automatically excluded from forwarding:

| Event Pattern | Description | Examples |
|---------------|-------------|----------|
| `gtm.*` | GTM lifecycle events | `gtm.js`, `gtm.dom`, `gtm.load`, `gtm.click` |
| `gtag.config` | Google Analytics configuration | `gtag.config` |
| `optimize.activate` | Google Optimize activation | `optimize.activate` |

---

### Stripped Properties

The following properties are automatically removed from forwarded events:

| Property | Reason |
|----------|--------|
| `event` | The event name is passed separately to `rybbit.event()` |
| `gtm.*` | GTM-specific metadata (e.g., `gtm.uniqueEventId`) |
| `eventCallback` | GTM callback function reference |
| `eventTimeout` | GTM timeout configuration |

**Example:**

```javascript
// dataLayer.push() with GTM metadata
dataLayer.push({
  event: 'purchase',
  value: 1299,
  currency: 'CZK',
  eventCallback: function() { /* ... */ },
  eventTimeout: 2000,
  'gtm.uniqueEventId': 42
});

// Forwarded to Rybbit (clean)
rybbit.event('purchase', {
  value: 1299,
  currency: 'CZK'
});
```

---

## Teardown

The GTM Bridge is automatically cleaned up when the Rybbit instance is destroyed:

```typescript
nksRybbit.destroy();
```

This operation:
- Restores the original `dataLayer.push()` method
- Stops forwarding events to Rybbit
- Removes all bridge-related listeners

> **Important:** After calling `destroy()`, you must reinitialize Rybbit with `boot()` to re-enable the GTM Bridge.

---

## Best Practices

### 1. Use Event Filtering for Production

Avoid forwarding all events in production environments. Use `gtmEvents` to whitelist only business-critical events:

```typescript
gtmEvents: ['purchase', 'lead', 'sign_up']
```

### 2. Maintain Consistent Event Names

Use the same event naming convention in GTM that you would use in Rybbit (e.g., `snake_case` for GA4 compatibility).

### 3. Test in Development

Verify events are being forwarded correctly by checking the browser console or Rybbit's debug mode:

```typescript
await nksRybbit.boot({
  // ... your config
  debug: true  // Enable console logging
});
```

### 4. Document Your Events

Maintain a list of forwarded events in your project documentation to avoid confusion between GTM-only and Rybbit-tracked events.

---

## Troubleshooting

### Events Not Forwarding

**Check 1:** Verify GTM Bridge is enabled
```typescript
gtmBridge: true
```

**Check 2:** Ensure event name is in whitelist (if using `gtmEvents`)
```typescript
gtmEvents: ['your_event_name']
```

**Check 3:** Confirm event is not a GTM internal event
Events like `gtm.js`, `gtm.dom`, `gtag.config` are intentionally ignored.

**Check 4:** Enable debug mode to see console logs
```typescript
debug: true
```

---

### Duplicate Events

If you see duplicate events in Rybbit, you may have both:
- GTM Bridge forwarding enabled
- Manual Custom HTML tags in GTM

**Solution:** Remove manual Custom HTML tags for events handled by GTM Bridge.

---

## Related Documentation

- [Getting Started](./getting-started.md)
- [Events Reference](./events.md)
- [API Reference](./api.md)
- [Examples](./examples.md)
