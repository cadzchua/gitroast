/**
 * Centralized configuration for analyzer thresholds, scoring weights,
 * and roast selection. All tunable numbers live here.
 *
 * Users can override these via a .gitroastrc JSON file at the repo root
 * or at ~/.gitroastrc (see loadUserConfig).
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export interface GitRoastConfig {
  /** Timing thresholds */
  lateNightStartHour: number;
  lateNightEndHour: number;
  fridayAfternoonStartHour: number;

  /** Pattern thresholds */
  bigDumpFileThreshold: number;
  bigDumpChangeThreshold: number;

  /** Roast selection */
  maxRoasts: number;
  minRoasts: number;
  maxPerCategory: number;

  /** LLM */
  llmDefaultModel: string;
  llmDefaultBaseUrl: string;
  llmMaxTokens: number;
  llmTemperature: number;
  llmCommitMessageMaxChars: number;

  /** Custom lazy-message regex patterns (strings, compiled at runtime) */
  extraLazyPatterns: { pattern: string; label: string; flags?: string }[];
}

export const DEFAULT_CONFIG: GitRoastConfig = {
  lateNightStartHour: 22,
  lateNightEndHour: 5,
  fridayAfternoonStartHour: 14,

  bigDumpFileThreshold: 20,
  bigDumpChangeThreshold: 500,

  maxRoasts: 8,
  minRoasts: 3,
  maxPerCategory: 2,

  llmDefaultModel: 'gpt-4o-mini',
  llmDefaultBaseUrl: 'https://api.openai.com/v1',
  llmMaxTokens: 1024,
  llmTemperature: 0.9,
  llmCommitMessageMaxChars: 200,

  extraLazyPatterns: [],
};

/**
 * Loads user config from .gitroastrc (repo root first, then home dir).
 * Returns DEFAULT_CONFIG merged with user overrides. Unknown keys are ignored.
 */
export function loadUserConfig(repoPath: string): GitRoastConfig {
  const candidates = [
    path.join(repoPath, '.gitroastrc'),
    path.join(repoPath, '.gitroastrc.json'),
    path.join(os.homedir(), '.gitroastrc'),
    path.join(os.homedir(), '.gitroastrc.json'),
  ];

  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw) as Partial<GitRoastConfig>;
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      // Silently ignore malformed configs; defaults are fine
    }
  }

  return DEFAULT_CONFIG;
}
