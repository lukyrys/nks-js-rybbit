import { describe, it, expect, vi, beforeEach } from "vitest";
import { enqueue, flush, getQueueSize, clearQueue } from "../queue";

beforeEach(() => {
  clearQueue();
});

describe("queue", () => {
  it("enqueues events", () => {
    enqueue("event", ["click", { btn: "hero" }]);
    expect(getQueueSize()).toBe(1);
  });

  it("flushes queued events in order", () => {
    enqueue("event", ["a"]);
    enqueue("event", ["b"]);
    enqueue("pageview", ["/home"]);

    const executed: string[] = [];
    flush((e) => executed.push(`${e.method}:${e.args[0]}`));

    expect(executed).toEqual(["event:a", "event:b", "pageview:/home"]);
    expect(getQueueSize()).toBe(0);
  });

  it("drops oldest events when queue is full", () => {
    for (let i = 0; i < 105; i++) {
      enqueue("event", [`evt_${i}`]);
    }
    expect(getQueueSize()).toBe(100);
  });

  it("clearQueue empties the queue", () => {
    enqueue("event", ["test"]);
    clearQueue();
    expect(getQueueSize()).toBe(0);
  });
});
