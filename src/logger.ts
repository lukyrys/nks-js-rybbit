let debugEnabled = false;
let dryRunEnabled = false;

const PREFIX = "[NksRybbit]";

export function setDebug(enabled: boolean): void {
  debugEnabled = enabled;
}

export function setDryRun(enabled: boolean): void {
  dryRunEnabled = enabled;
}

export function isDryRun(): boolean {
  return dryRunEnabled;
}

export function log(...args: unknown[]): void {
  if (debugEnabled) {
    console.log(PREFIX, ...args);
  }
}

export function warn(...args: unknown[]): void {
  if (debugEnabled) {
    console.warn(PREFIX, ...args);
  }
}

export function error(...args: unknown[]): void {
  console.error(PREFIX, ...args);
}
