import fetch from 'node-fetch';
import { prompts } from '../config/prompts.js';
const mode = 'extract_intent'; // Change this to switch between different prompt modes
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = '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';
const projectAliases = {
    chatportal: ['project chatportal', 'chatportal', 'chat-portal app', 'chat portal backend', 'chat'],
    beta: ['project beta', 'beta', 'beta portal', 'beta frontend', 'beta api'],
    gamma: ['project gamma', 'gamma', 'gamma dashboard', 'gamma microservice']
};
let lastUsedContext = {};
function normalizeProjectName(name) {
    return name.trim().toLowerCase().replace(/[\s\-]+/g, ' ');
}
function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++)
        dp[i][0] = i;
    for (let j = 0; j <= b.length; j++)
        dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
            else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[a.length][b.length];
}
function resolveProjectId(projectName) {
    const normalizedInput = normalizeProjectName(projectName);
    for (const [projectId, aliases] of Object.entries(projectAliases)) {
        for (const alias of aliases) {
            if (normalizedInput.includes(normalizeProjectName(alias))) {
                return projectId;
            }
        }
    }
    // Fuzzy match fallback
    let bestMatch = '';
    let bestDistance = Infinity;
    for (const [projectId, aliases] of Object.entries(projectAliases)) {
        for (const alias of aliases) {
            const distance = levenshtein(normalizedInput, normalizeProjectName(alias));
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = projectId;
            }
        }
    }
    return bestMatch || normalizedInput;
}
async function fetchProjectStats(projectId) {
    const res = await fetch(`http://localhost:3000/projects/${projectId}/stats`);
    if (!res.ok) {
        throw new Error(`Failed to fetch stats for project: ${projectId}`);
    }
    return await res.json();
}
export async function interpretPrompt(message) {
    const systemPrompt = prompts[mode].system;
    console.log('Using system prompt:', systemPrompt);
    const userPrompt = prompts[mode].user(message);
    console.log('Using user prompt:', userPrompt);
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ]
        })
    });
    const json = await response.json();
    const content = json.choices?.[0]?.message?.content ?? '';
    console.log('OpenRouter response:', JSON.stringify(json));
    try {
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        const raw = content.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(raw);
        // Fill missing fields with context
        const intent = parsed.intent || lastUsedContext.intent || 'getDefectStats';
        const projectRaw = parsed.project || lastUsedContext.project;
        const status = parsed.status || lastUsedContext.status || 'open';
        const sprint = parsed.sprint || lastUsedContext.sprint || 'current';
        const projectId = resolveProjectId(projectRaw || '');
        const stats = intent === 'getDefectStats' ? await fetchProjectStats(projectId) : undefined;
        // Save current as context
        lastUsedContext = { intent, project: projectRaw, status, sprint };
        const summary = `Fetching ${status} defects for project "${projectId}" in ${sprint} sprint...`;
        return {
            intent,
            project: projectRaw || projectId,
            status,
            sprint,
            projectId,
            stats,
            message: summary
        };
    }
    catch (e) {
        throw new Error(`Failed to parse LLM response: ${content}`);
    }
}
