# API Reference

Complete API documentation for **@nks-hub/rybbit** - a TypeScript SDK for Rybbit Analytics.

---

## Table of Contents

- [Module Exports](#module-exports)
- [Configuration](#configuration)
- [Initialization](#initialization)
- [Core Tracking](#core-tracking)
- [Typed Events](#typed-events)
  - [E-commerce Events](#e-commerce-events)
  - [User Events](#user-events)
  - [Engagement Events](#engagement-events)
  - [CMS Events](#cms-events)
  - [Lead Generation Events](#lead-generation-events)
- [User Identity](#user-identity)
- [Session Replay](#session-replay)
- [Global Properties](#global-properties)
- [Lifecycle Hooks](#lifecycle-hooks)

---

## Module Exports

The SDK provides both a singleton instance and a class for advanced use cases.

```typescript
// Singleton instance (recommended for most applications)
import nksRybbit from '@nks-hub/rybbit';

// Class for multiple instances
import { NksRybbitSDK } from '@nks-hub/rybbit';

// TypeScript types
import type {
  NksRybbitConfig,
  EventProperties,
  PropertyValue,
  EcommerceItem,
  StandardEvents,
} from '@nks-hub/rybbit';
```

---

## Configuration

### NksRybbitConfig

Configuration object passed to the `boot()` method during initialization.

| Property             | Type                  | Default                   | Description                                    |
|----------------------|-----------------------|---------------------------|------------------------------------------------|
| `host`               | `string`              | **required**              | Rybbit instance URL                            |
| `siteId`             | `string`              | **required**              | Site ID from Rybbit dashboard                  |
| `debug`              | `boolean`             | `false`                   | Enable console logging for debugging           |
| `dryRun`             | `boolean`             | `false`                   | Log events to console without sending          |
| `disableReplay`      | `boolean`             | `false`                   | Disable session replay functionality           |
| `loadStrategy`       | `'script'` \| `'sdk'` \| `'detect'` | `'detect'`    | Loading strategy for Rybbit tracker            |
| `loadTimeout`        | `number`              | `5000`                    | Maximum time (ms) to wait for tracker load    |
| `autoIdentify`       | `boolean`             | `true`                    | Automatically identify users from DOM          |
| `identitySelector`   | `string`              | `'[data-nks-user-id]'`    | CSS selector for user identity element         |
| `gtmBridge`          | `boolean`             | `false`                   | Enable Google Tag Manager bridge               |
| `gtmEvents`          | `string[]`            | `[]`                      | List of GTM events to forward to Rybbit        |
| `globalProperties`   | `Record<string, PropertyValue>` | `{}`        | Properties automatically added to every event  |

**Example:**

```typescript
await nksRybbit.boot({
  host: 'https://analytics.example.com',
  siteId: 'my-site-123',
  debug: true,
  loadStrategy: 'script',
  globalProperties: {
    app_version: '1.2.3',
    environment: 'production'
  }
});
```

---

## Initialization

Methods for initializing and managing the SDK lifecycle.

### `boot(config: NksRybbitConfig): Promise<void>`

Initialize the SDK with the provided configuration. Safe to call before DOM ready.

```typescript
await nksRybbit.boot({
  host: 'https://analytics.example.com',
  siteId: 'my-site-123'
});
```

### `isReady(): boolean`

Check if the SDK is fully initialized and Rybbit tracker is loaded.

```typescript
if (nksRybbit.isReady()) {
  console.log('SDK is ready');
}
```

### `getState(): BootState`

Get the current initialization state of the SDK.

**Returns:** `'idle'` | `'booting'` | `'ready'` | `'failed'`

```typescript
const state = nksRybbit.getState();
```

### `destroy(): void`

Tear down the SDK, clean up event listeners, and clear the event queue.

```typescript
nksRybbit.destroy();
```

---

## Core Tracking

Core methods for tracking events, pageviews, and user interactions.

### `event(name: string, properties?: EventProperties): void`

Send a custom event with optional properties. Events are queued if SDK is not ready.

```typescript
nksRybbit.event('button_click', {
  button_name: 'subscribe',
  location: 'header'
});
```

### `pageview(path?: string): void`

Send a pageview event. Uses `window.location.pathname` if no path is provided.

```typescript
// Current page
nksRybbit.pageview();

// Specific path
nksRybbit.pageview('/products/item-123');
```

### `trackOutbound(url: string, text?: string, target?: string): void`

Track an outbound link click.

```typescript
nksRybbit.trackOutbound(
  'https://external-site.com',
  'Learn More',
  '_blank'
);
```

### `trackError(error: Error | ErrorEvent, context?: EventProperties): void`

Track a JavaScript error with optional context.

```typescript
try {
  // risky operation
} catch (error) {
  nksRybbit.trackError(error, {
    component: 'checkout',
    action: 'payment_submit'
  });
}
```

---

## Typed Events

Pre-defined typed events for common analytics scenarios. These methods provide type safety and consistent event naming.

### E-commerce Events

Track e-commerce interactions with standardized properties.

| Method                                      | Event Name          | Required Properties           | Optional Properties                      |
|---------------------------------------------|---------------------|-------------------------------|------------------------------------------|
| `trackViewItem(item)`                       | `view_item`         | `itemId`, `itemName`          | `category`, `price`                      |
| `trackAddToCart(item)`                      | `add_to_cart`       | `itemId`, `itemName`          | `price`, `quantity`                      |
| `trackRemoveFromCart(item)`                 | `remove_from_cart`  | `itemId`, `itemName`          | —                                        |
| `trackViewCart(data)`                       | `view_cart`         | —                             | `itemsCount`, `value`, `currency`        |
| `trackBeginCheckout(data)`                  | `begin_checkout`    | —                             | `value`, `currency`, `itemsCount`        |
| `trackPurchase(data)`                       | `purchase`          | `transactionId`, `value`      | `currency`, `items`                      |
| `trackRefund(txId, value?, currency?)`      | `refund`            | `transactionId`               | `value`, `currency`                      |
| `trackAddToWishlist(item)`                  | `add_to_wishlist`   | `itemId`, `itemName`          | `price`                                  |
| `trackViewPromotion(data)`                  | `view_promotion`    | —                             | `promotionId`, `promotionName`, `location` |
| `trackSelectPromotion(id?, name?)`          | `select_promotion`  | —                             | `promotionId`, `promotionName`           |

**Example:**

```typescript
nksRybbit.trackViewItem({
  itemId: 'SKU-123',
  itemName: 'Premium Widget',
  category: 'Widgets',
  price: 29.99
});

nksRybbit.trackPurchase({
  transactionId: 'ORDER-456',
  value: 99.99,
  currency: 'USD',
  items: 3
});
```

### User Events

Track user authentication and account actions.

| Method                  | Event Name | Optional Properties |
|-------------------------|------------|---------------------|
| `trackLogin(method?)`   | `login`    | `method`            |
| `trackSignUp(method?)`  | `sign_up`  | `method`            |
| `trackLogout()`         | `logout`   | —                   |

**Example:**

```typescript
nksRybbit.trackLogin('google');
nksRybbit.trackSignUp('email');
nksRybbit.trackLogout();
```

### Engagement Events

Track user engagement with content and features.

| Method                                  | Event Name       | Required Properties | Optional Properties                            |
|-----------------------------------------|------------------|---------------------|------------------------------------------------|
| `trackSearch(term, count?)`             | `search`         | `search_term`       | `results_count`                                |
| `trackShare(data?)`                     | `share`          | —                   | `method`, `contentType`, `itemId`              |
| `trackClickCta(button?, location?)`     | `click_cta`      | —                   | `button`, `location`                           |
| `trackVideoPlay(data?)`                 | `video_play`     | —                   | `videoId`, `videoTitle`, `duration`            |
| `trackScrollDepth(percent, page?)`      | `scroll_depth`   | `percent`           | `page`                                         |
| `trackFileDownload(name, ext?)`         | `file_download`  | `file_name`         | `file_extension`                               |

**Example:**

```typescript
nksRybbit.trackSearch('wireless headphones', 42);
nksRybbit.trackScrollDepth(75, '/blog/article-123');
nksRybbit.trackFileDownload('product-catalog.pdf', 'pdf');
```

### CMS Events

Track content management system interactions.

| Method                              | Event Name       | Optional Properties         |
|-------------------------------------|------------------|-----------------------------|
| `trackComment(pageId?, title?)`     | `comment_submit` | `page_id`, `page_title`     |
| `trackRating(rating, itemId?, max?)` | `rating_submit`  | `item_id`, `max_rating`     |

**Example:**

```typescript
nksRybbit.trackComment('post-789', 'How to Build a SaaS App');
nksRybbit.trackRating(4, 'product-456', 5);
```

### Lead Generation Events

Track lead generation and conversion activities.

| Method                              | Event Name              | Optional Properties      |
|-------------------------------------|-------------------------|--------------------------|
| `trackGenerateLead(source?, value?)` | `generate_lead`         | `source`, `value`        |
| `trackContactForm(formId?, name?)`  | `contact_form_submit`   | `form_id`, `form_name`   |
| `trackNewsletter(source?)`          | `newsletter_subscribe`  | `source`                 |

**Example:**

```typescript
nksRybbit.trackGenerateLead('landing_page', 500);
nksRybbit.trackContactForm('contact-main', 'Contact Us Form');
nksRybbit.trackNewsletter('footer');
```

---

## User Identity

Manage user identification and traits for personalized analytics.

### `identify(userId: string, traits?: Record<string, unknown>): void`

Identify a user with a unique ID and optional traits.

```typescript
nksRybbit.identify('user-123', {
  email: 'user@example.com',
  plan: 'premium',
  signup_date: '2024-01-15'
});
```

### `setTraits(traits: Record<string, unknown>): void`

Update user traits without changing the user ID.

```typescript
nksRybbit.setTraits({
  subscription_status: 'active',
  last_login: new Date().toISOString()
});
```

### `clearUserId(): void`

Clear the current user identity (e.g., on logout).

```typescript
nksRybbit.clearUserId();
```

### `getUserId(): string | null`

Get the currently identified user ID.

```typescript
const userId = nksRybbit.getUserId();
console.log('Current user:', userId);
```

---

## Session Replay

Control session replay recording for user behavior analysis.

### `startReplay(): void`

Start recording a session replay.

```typescript
nksRybbit.startReplay();
```

### `stopReplay(): void`

Stop recording the current session replay.

```typescript
nksRybbit.stopReplay();
```

### `isReplayActive(): boolean`

Check if session replay is currently active.

```typescript
if (nksRybbit.isReplayActive()) {
  console.log('Session is being recorded');
}
```

---

## Global Properties

Add properties that are automatically included with every event.

### `setGlobalProperty(key: string, value: string | number | boolean): void`

Add a global property to all future events.

```typescript
nksRybbit.setGlobalProperty('user_tier', 'premium');
nksRybbit.setGlobalProperty('ab_test_variant', 'B');
```

### `removeGlobalProperty(key: string): void`

Remove a previously set global property.

```typescript
nksRybbit.removeGlobalProperty('ab_test_variant');
```

---

## Lifecycle Hooks

Register callbacks for SDK lifecycle events.

### `onReady(callback: () => void): void`

Register a callback to be invoked when the SDK becomes ready. If the SDK is already ready, the callback fires immediately.

```typescript
nksRybbit.onReady(() => {
  console.log('SDK is ready to track events');
  nksRybbit.pageview();
});
```

### `onEvent(callback: (name: string, props?: EventProperties) => void): () => void`

Listen to all events sent through the SDK. Returns an unsubscribe function.

```typescript
const unsubscribe = nksRybbit.onEvent((eventName, properties) => {
  console.log('Event tracked:', eventName, properties);
});

// Later: stop listening
unsubscribe();
```

### `onPageChange(callback: (path: string, previousPath: string) => void): () => void`

Listen to single-page application (SPA) page changes. Requires native Rybbit support for SPA routing.

```typescript
const unsubscribe = nksRybbit.onPageChange((newPath, oldPath) => {
  console.log('Navigated from', oldPath, 'to', newPath);
});

// Later: stop listening
unsubscribe();
```

---

## Additional Resources

- [Getting Started](./getting-started.md)
- [Events Reference](./events.md)
- [Examples](./examples.md)
- [GitHub Repository](https://github.com/nks-hub/nks-js-rybbit)
