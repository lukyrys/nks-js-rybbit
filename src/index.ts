export { NksRybbitSDK, getInstance, resetInstance } from "./nks-rybbit";
export type {
  NksRybbitConfig,
  EventProperties,
  PropertyValue,
  EcommerceItem,
  EventCallback,
  ReadyCallback,
  RybbitNativeAPI,
  StandardEvents,
} from "./types";

import { getInstance } from "./nks-rybbit";

/**
 * Default singleton instance.
 *
 * Usage (script tag):
 *   <script src="nks-rybbit.iife.min.js"></script>
 *   <script>
 *     NksRybbit.default.boot({ host: 'https://demo.rybbit.com', siteId: 'abc123' });
 *     NksRybbit.default.event('click_cta', { button: 'hero' });
 *   </script>
 *
 * Usage (ES module):
 *   import nksRybbit from '@nks-hub/rybbit';
 *   await nksRybbit.boot({ host: 'https://demo.rybbit.com', siteId: 'abc123' });
 *   nksRybbit.event('click_cta', { button: 'hero' });
 */
const nksRybbit = getInstance();
export default nksRybbit;
