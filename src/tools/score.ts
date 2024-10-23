import { isLicenseCompatible } from "./metrics/license.js";
import { getBusFactorScore } from "./metrics/busFactor.js";
import { getIRM } from "./metrics/irmMetric.js";
import { calculateRampUpScore } from "./metrics/rampUpTime.js";
import { getCorrectness } from "./metrics/correctness.js";
import { measureConcurrentLatencies } from "./metrics/latency.js";
import { getDependencyFraction } from "./metrics/fracDependencies.js";
import { getPrFraction } from "./metrics/prFraction.js";

/**
 * Gets the scores for a given repository.
 *
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param url - The URL of the repository.
 * @returns The scores for the repository.
 */
export async function getScores(owner: string, repo: string, url: string): Promise<string> {

  // Run the functions concurrently and measure the latencies
  const { latencies, results, errors } = await measureConcurrentLatencies([calculateRampUpScore, getCorrectness, getBusFactorScore, getIRM, isLicenseCompatible, getDependencyFraction, getPrFraction], owner, repo);

  const rampUp = results[0] ?? 0;
  const rampUpLatency = latencies[0];

  const correctness = results[1] ?? 0;
  const correctnessLatency = latencies[1];

  const busFactor = results[2] ?? 0;
  const busFactorLatency = latencies[2];

  const responsiveMaintainer = results[3] ?? 0;
  const responsiveMaintainerLatency = latencies[3];

  const license = results[4] ?? 0;
  const licenseLatency = latencies[4];

  const fractionDependencies = results[5] ?? 0;
  const fractionDependenciesLatency = latencies[5];

  const prFraction = results[6] ?? 0;
  const prFractionLatency = latencies[6];

  // calculate the net score and latency
  const netScore = Number(((0.125 * rampUp + 0.125 * correctness + 0.25 * busFactor + 0.25 * responsiveMaintainer + 0.125 * prFraction) * license).toFixed(3));
  const netScoreLatency = Number((rampUpLatency + correctnessLatency + busFactorLatency + responsiveMaintainerLatency + licenseLatency + prFractionLatency).toFixed(3));

  // Output the results
  const output = {
    "URL": url,
    "NetScore": netScore,
    "NetScore_Latency": netScoreLatency,
    "RampUp": rampUp,
    "RampUp_Latency": rampUpLatency,
    "Correctness": correctness,
    "Correctness_Latency": correctnessLatency,
    "BusFactor": busFactor,
    "BusFactor_Latency": busFactorLatency,
    "ResponsiveMaintainer": responsiveMaintainer,
    "ResponsiveMaintainer_Latency": responsiveMaintainerLatency,
    "License": license,
    "License_Latency": licenseLatency,
    "FractionDependencies": fractionDependencies,
    "FractionDependencies_Latency": fractionDependenciesLatency,
    "prFraction": prFraction,
    "prFraction_Latency": prFractionLatency
  };

  return JSON.stringify(output);
}
