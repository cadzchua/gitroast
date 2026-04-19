import { AnalysisResult, Roast, RoastResult } from '../types';
import { ROAST_TEMPLATES } from './templates';
import { calculateScore } from './scoring';
import { generateLLMRoasts } from './llm';
import { GitRoastConfig, DEFAULT_CONFIG } from '../config';
import { MissingAPIKeyError } from '../errors';

export interface GenerateOptions {
  config?: GitRoastConfig;
  maxRoasts?: number;
  onAIFallback?: (reason: string) => void;
}

/**
 * Generates roasts based on the analysis results using hardcoded templates.
 */
export function generateRoasts(stats: AnalysisResult, options: GenerateOptions = {}): RoastResult {
  const config = options.config ?? DEFAULT_CONFIG;
  const maxRoasts = options.maxRoasts ?? config.maxRoasts;
  const minRoasts = Math.min(config.minRoasts, maxRoasts);

  const score = calculateScore(stats);

  const applicableRoasts: Roast[] = [];

  for (const template of ROAST_TEMPLATES) {
    if (template.condition(stats)) {
      const messageIdx = Math.floor(Math.random() * template.messages.length);
      const text = template.messages[messageIdx](stats);

      applicableRoasts.push({
        category: template.category,
        emoji: template.emoji,
        text,
        severity: template.severity,
      });
    }
  }

  const severityOrder = { savage: 0, medium: 1, mild: 2 };
  applicableRoasts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const selectedRoasts = selectDiverseRoasts(applicableRoasts, maxRoasts, config.maxPerCategory);

  if (selectedRoasts.length < minRoasts) {
    selectedRoasts.push({
      category: 'general',
      emoji: '🍖',
      text: `We analyzed ${stats.meta.totalCommits} commits and honestly? We've seen worse. But not by much.`,
      severity: 'mild',
    });
  }

  return { roasts: selectedRoasts, score, stats };
}

/**
 * Generates roasts using an AI/LLM API.
 * Falls back to template-based roasts if the API call fails.
 * Missing-API-key errors re-throw so the CLI can surface them cleanly.
 */
export async function generateAIRoasts(
  stats: AnalysisResult,
  options: GenerateOptions = {},
): Promise<RoastResult> {
  const config = options.config ?? DEFAULT_CONFIG;
  const score = calculateScore(stats);

  try {
    const roasts = await generateLLMRoasts(stats, score, config);

    if (roasts.length === 0) {
      throw new Error('LLM returned no valid roasts');
    }

    return { roasts, score, stats };
  } catch (error) {
    if (error instanceof MissingAPIKeyError) {
      throw error;
    }

    options.onAIFallback?.((error as Error).message);
    return generateRoasts(stats, options);
  }
}

function selectDiverseRoasts(roasts: Roast[], maxCount: number, maxPerCategory: number): Roast[] {
  const selected: Roast[] = [];
  const categoryCount = new Map<string, number>();

  for (const roast of roasts) {
    const count = categoryCount.get(roast.category) || 0;
    if (count < maxPerCategory && selected.length < maxCount) {
      selected.push(roast);
      categoryCount.set(roast.category, count + 1);
    }
  }

  if (selected.length < maxCount) {
    const selectedSet = new Set(selected);
    for (const roast of roasts) {
      if (!selectedSet.has(roast) && selected.length < maxCount) {
        selected.push(roast);
      }
    }
  }

  return selected;
}
