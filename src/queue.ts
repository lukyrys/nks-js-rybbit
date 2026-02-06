import { QueuedEvent } from "./types";
import { log, warn } from "./logger";

const MAX_QUEUE_SIZE = 100;
let queue: QueuedEvent[] = [];
let flushing = false;

export function enqueue(method: string, args: unknown[]): void {
  if (queue.length >= MAX_QUEUE_SIZE) {
    warn(`Event queue full (${MAX_QUEUE_SIZE}), dropping oldest event`);
    queue.shift();
  }
  queue.push({ method, args, timestamp: Date.now() });
  log(`Queued: ${method}`, args);
}

export function flush(executor: (event: QueuedEvent) => void): void {
  if (flushing || queue.length === 0) return;
  flushing = true;

  log(`Flushing ${queue.length} queued events`);
  const events = [...queue];
  queue = [];

  for (const event of events) {
    try {
      executor(event);
    } catch (e) {
      warn("Failed to replay queued event:", event.method, e);
    }
  }

  flushing = false;
}

export function getQueueSize(): number {
  return queue.length;
}

export function clearQueue(): void {
  queue = [];
}
