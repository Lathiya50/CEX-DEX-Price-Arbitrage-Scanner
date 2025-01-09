// Queue for processing updates
// Rate limiting configurations
const UPDATE_INTERVAL = 5000; // 5 seconds between updates
const BATCH_SIZE = 1; // Process one symbol at a time
const QUEUE_DELAY = 2000; // 2 second delay between queue processing

class UpdateQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  add(trade) {
    this.queue.push(trade);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const trades = this.queue.splice(0, BATCH_SIZE);

    for (const trade of trades) {
      try {
        await processTradeUpdate(trade);
      } catch (error) {
        console.error("Error processing trade:", error);
      }
      // Wait between processing each trade
      await new Promise((resolve) => setTimeout(resolve, QUEUE_DELAY));
    }

    // Schedule next batch
    setTimeout(() => this.processQueue(), UPDATE_INTERVAL);
  }
}

export default new UpdateQueue();
