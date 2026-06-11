/**
 * Base class for the Transactional Outbox Pattern.
 * Each service extends this and injects its own PrismaService.
 * The worker polls the outbox_events table and publishes unpublished events.
 */
export abstract class OutboxWorker {
  abstract pollAndPublish(): Promise<void>;

  protected async withRetry(fn: () => Promise<void>, maxAttempts = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }
}
