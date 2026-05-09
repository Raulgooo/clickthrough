import type {
  HarnessEvent,
  HarnessRunInput,
  HarnessSession,
  HarnessSessionInput,
} from "./contracts";

type EventQueueItem =
  | { done: false; event: HarnessEvent }
  | { done: true; event?: never };

const DEFAULT_DELAY_MS = 80;

export class LocalHarnessSession implements HarnessSession {
  readonly id: string;

  private queue: EventQueueItem[] = [];
  private waiters: Array<(item: EventQueueItem) => void> = [];
  private closed = false;

  constructor(id: string) {
    this.id = id;
  }

  async streamInput(input: HarnessSessionInput): Promise<void> {
    if (this.closed) return;

    if (input.type === "interrupt") {
      this.emit({
        type: "state.changed",
        state: input.action === "cancel" ? "cancelled" : "waiting_for_user",
        message: `Run ${input.action} requested.`,
      });
      return;
    }

    if (input.type === "approval.resolved") {
      this.emit({ type: "approval.resolved", decision: input.decision });
      return;
    }

    await this.runOnce({
      runId: crypto.randomUUID(),
      sessionId: this.id,
      intent: input.intent,
      page: input.page,
    });
  }

  async *events(): AsyncIterable<HarnessEvent> {
    while (!this.closed || this.queue.length > 0) {
      const item = await this.nextQueueItem();
      if (item.done) return;
      yield item.event;
    }
  }

  interrupt(): void {
    this.emit({
      type: "state.changed",
      state: "cancelled",
      message: "Run cancelled by user.",
    });
  }

  close(): void {
    this.closed = true;
    this.flushDone();
  }

  private async runOnce(input: HarnessRunInput): Promise<void> {
    this.emit({ type: "state.changed", state: "receiving_intent", message: input.intent.prompt });
    await delay(DEFAULT_DELAY_MS);
    this.emit({ type: "state.changed", state: "observing_page", message: input.page.title });
    await delay(DEFAULT_DELAY_MS);
    this.emit({ type: "state.changed", state: "classifying_intent", message: "Classifying intent." });
    await delay(DEFAULT_DELAY_MS);
    this.emit({ type: "state.changed", state: "planning", message: "Planning tools and UI." });
  }

  private emit(event: HarnessEvent): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ done: false, event });
      return;
    }
    this.queue.push({ done: false, event });
  }

  private nextQueueItem(): Promise<EventQueueItem> {
    const item = this.queue.shift();
    if (item) return Promise.resolve(item);
    if (this.closed) return Promise.resolve({ done: true });
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  private flushDone(): void {
    for (const waiter of this.waiters.splice(0)) {
      waiter({ done: true });
    }
  }
}

export function createLocalHarnessSession(sessionId = crypto.randomUUID()): HarnessSession {
  return new LocalHarnessSession(sessionId);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
