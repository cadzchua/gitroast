import { AnalysisResult, Roast, RoastScore } from '../types';
import { formatHour, getDayName } from '../analyzers/timing';

/**
 * Generates roasts using an OpenAI-compatible LLM API.
 * Requires GITROAST_API_KEY to be set in environment.
 */
export async function generateLLMRoasts(
  stats: AnalysisResult,
  score: RoastScore,
): Promise<Roast[]> {
  const apiKey = process.env.GITROAST_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GITROAST_API_KEY is not set. Create a .env file with your API key.\n' +
        '  See: https://github.com/cadzchua/gitroast#-ai-powered-roasts',
    );
  }

  const model = process.env.GITROAST_MODEL || 'gpt-4o-mini';
  const baseUrl = (process.env.GITROAST_API_BASE || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(stats, score);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `LLM API returned ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content: string = data.choices?.[0]?.message?.content || '';

  return parseRoasts(content);
}

/**
 * System prompt that instructs the LLM on how to generate roasts.
 */
function buildSystemPrompt(): string {
  return `You are Git Roast, a brutally honest and hilariously savage code reviewer. Your job is to roast developers based on their Git commit habits.

RULES:
- Be funny, creative, and savage. Use dark humor, pop culture references, and clever wordplay.
- Each roast should be 1-2 sentences max.
- Roasts must be based on the actual data provided — never make up stats.
- Assign each roast a category, emoji, and severity.

You MUST respond with ONLY a valid JSON array (no markdown, no code fences, no extra text). Each element must follow this exact schema:
{
  "category": "timing" | "messages" | "patterns" | "files" | "general",
  "emoji": "<a single relevant emoji>",
  "text": "<the roast text>",
  "severity": "mild" | "medium" | "savage"
}

Generate between 4 and 8 roasts. Cover different categories. Prioritize savage roasts for truly bad habits, and use mild for borderline acceptable behavior.`;
}

/**
 * Builds the user prompt with all the analysis data for the LLM.
 */
function buildUserPrompt(stats: AnalysisResult, score: RoastScore): string {
  const { timing, messages, patterns, files, meta } = stats;

  return `Roast this developer based on their Git data:

**Developer:** ${meta.author} @ ${meta.repoName}
**Total Commits:** ${meta.totalCommits}
**Period:** ${meta.firstCommitDate.toLocaleDateString()} → ${meta.lastCommitDate.toLocaleDateString()}

**Overall Score:** ${score.overall}/100 (${score.level})
**Category Scores:** ${score.categoryScores.map((c) => `${c.label}: ${c.grade} (${c.score}/100)`).join(', ')}

## Timing
- Late-night commits (10PM-5AM): ${Math.round(timing.lateNightPercentage)}%
- Weekend commits: ${Math.round(timing.weekendPercentage)}%
- Friday afternoon commits: ${timing.fridayAfternoonCommits}
- Busiest hour: ${formatHour(timing.busiestHour)}
- Busiest day: ${getDayName(timing.busiestDay)}

## Commit Messages
- Average message length: ${messages.averageLength} characters
- Lazy/generic messages: ${Math.round(messages.lazyMessagePercentage)}%
- One-word messages: ${messages.oneWordMessages}
- ALL CAPS messages: ${messages.allCapsMessages}
- Shortest message: "${messages.shortestMessage}"
- Most repeated: ${messages.repeatedMessages.length > 0 ? `"${messages.repeatedMessages[0].message}" (${messages.repeatedMessages[0].count}x)` : 'N/A'}

## Patterns
- Longest streak: ${patterns.longestStreak} days
- Longest drought: ${patterns.longestDrought} days
- Consistency: ${patterns.consistencyScore}% (${patterns.totalActiveDays} active days out of ${patterns.totalDaysSpan})
- Avg commits/active day: ${patterns.averageCommitsPerDay}
- Big dumps (20+ files or 500+ line changes): ${patterns.bigDumps.length}

## Files
- Avg files per commit: ${files.averageFilesPerCommit}
- Largest single commit: ${files.largestCommitFiles} files
- Total insertions: ${files.totalInsertions.toLocaleString()}
- Total deletions: ${files.totalDeletions.toLocaleString()}
- Add/delete ratio: ${files.addDeleteRatio}:1

Now roast them. Be creative and brutal.`;
}

/**
 * Parses the LLM response into Roast objects.
 * Handles potential markdown code fences and validates the structure.
 */
function parseRoasts(content: string): Roast[] {
  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  let parsed: unknown[];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse LLM response as JSON. The AI returned an unexpected format.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('LLM response is not a JSON array.');
  }

  const validCategories = ['timing', 'messages', 'patterns', 'files', 'general'];
  const validSeverities = ['mild', 'medium', 'savage'];

  return parsed
    .filter(
      (item: any) =>
        item &&
        typeof item.text === 'string' &&
        typeof item.emoji === 'string' &&
        validCategories.includes(item.category) &&
        validSeverities.includes(item.severity),
    )
    .map((item: any) => ({
      category: item.category,
      emoji: item.emoji,
      text: item.text,
      severity: item.severity,
    }));
}
