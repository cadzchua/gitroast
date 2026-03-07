import { AnalysisResult, Roast, RoastResult } from '../types';
import { ROAST_TEMPLATES } from './templates';
import { calculateScore } from './scoring';
import { generateLLMRoasts } from './llm';

/** Maximum number of roasts to display */
const MAX_ROASTS = 8;

/** Minimum number of roasts to display */
const MIN_ROASTS = 3;

/**
 * Generates roasts based on the analysis results using hardcoded templates.
 * Selects applicable templates, picks random message variants, and limits output.
 */
export function generateRoasts(stats: AnalysisResult): RoastResult {
  const score = calculateScore(stats);

  // Find all applicable roasts
  const applicableRoasts: Roast[] = [];

  for (const template of ROAST_TEMPLATES) {
    if (template.condition(stats)) {
      // Pick a random message variant
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

  // Sort by severity (savage first, then medium, then mild)
  const severityOrder = { savage: 0, medium: 1, mild: 2 };
  applicableRoasts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Ensure variety: pick from different categories
  const selectedRoasts = selectDiverseRoasts(applicableRoasts, MAX_ROASTS);

  // If we have too few roasts, add fallback
  if (selectedRoasts.length < MIN_ROASTS) {
    selectedRoasts.push({
      category: 'general',
      emoji: '🍖',
      text: `We analyzed ${stats.meta.totalCommits} commits and honestly? We've seen worse. But not by much.`,
      severity: 'mild',
    });
  }

  return {
    roasts: selectedRoasts,
    score,
    stats,
  };
}

/**
 * Generates roasts using an AI/LLM API.
 * Falls back to template-based roasts if the API call fails.
 */
export async function generateAIRoasts(stats: AnalysisResult): Promise<RoastResult> {
  const score = calculateScore(stats);

  try {
    const roasts = await generateLLMRoasts(stats, score);

    if (roasts.length === 0) {
      throw new Error('LLM returned no valid roasts');
    }

    return {
      roasts,
      score,
      stats,
    };
  } catch (error) {
    // If API key is missing, throw so the CLI can show a helpful error
    if ((error as Error).message.includes('GITROAST_API_KEY')) {
      throw error;
    }

    // For other errors, fall back to templates
    console.error(`\n  ⚠️  AI roast failed: ${(error as Error).message}`);
    console.error('  Falling back to template roasts...\n');
    return generateRoasts(stats);
  }
}

/**
 * Selects a diverse set of roasts, ensuring category variety.
 */
function selectDiverseRoasts(roasts: Roast[], maxCount: number): Roast[] {
  const selected: Roast[] = [];
  const categoryCount = new Map<string, number>();

  // First pass: pick at most 2 from each category
  for (const roast of roasts) {
    const count = categoryCount.get(roast.category) || 0;
    if (count < 2 && selected.length < maxCount) {
      selected.push(roast);
      categoryCount.set(roast.category, count + 1);
    }
  }

  // Second pass: fill remaining slots with any leftover savage/medium roasts
  if (selected.length < maxCount) {
    for (const roast of roasts) {
      if (!selected.includes(roast) && selected.length < maxCount) {
        selected.push(roast);
      }
    }
  }

  return selected;
}
