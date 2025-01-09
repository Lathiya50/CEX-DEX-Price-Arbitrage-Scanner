import * as tf from "@tensorflow/tfjs-node";

export class PredictionModel {
  constructor() {
    this.model = null;
  }

  createModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [5], // 5 features
          units: 32,
          activation: "relu",
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: "relu",
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 1,
          activation: "sigmoid",
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });
  }

  async train(features, labels, epochs = 50) {
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels.map((l) => [l]));

    await this.model.fit(xs, ys, {
      epochs: epochs,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(
            `Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(
              4
            )}, accuracy = ${logs.acc.toFixed(4)}`
          );
        },
      },
    });

    xs.dispose();
    ys.dispose();
  }

  async predict(features) {
    const input = tf.tensor2d([features]);
    const prediction = await this.model.predict(input);
    const confidence = await prediction.data();
    input.dispose();
    prediction.dispose();
    return confidence[0];
  }

  async backtest(data) {
    const results = {
      predictions: [],
      accuracy: 0,
      totalTrades: 0,
      profitableTrades: 0,
      pnl: 0,
    };

    let correct = 0;
    let total = 0;

    for (const point of data) {
      if (point.target === null) continue;

      const features = [
        point.normalized_returns,
        point.normalized_volatility,
        point.normalized_ma7,
        point.normalized_ma25,
        point.normalized_rsi,
      ];

      const confidence = await this.predict(features);
      const predictedDirection = confidence > 0.5;
      const actualDirection = point.target === 1;

      if (predictedDirection === actualDirection) correct++;
      total++;

      results.predictions.push({
        timestamp: point.timestamp,
        confidence,
        predictedDirection,
        actualDirection,
        price: point.close,
      });
    }

    results.accuracy = (correct / total) * 100;
    results.totalTrades = total;
    results.profitableTrades = correct;

    return results;
  }
}
