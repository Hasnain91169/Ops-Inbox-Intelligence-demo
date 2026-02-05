import OpenAI from 'openai'
import type { Extracted } from '@/lib/extract'

type LlmInput = {
  email: { subject: string; body: string; from: string; received_ts: string }
  extracted: Extracted
  classification: { category: string; confidence: number }
  urgency: { sentiment: string; urgency_score: number }
  routing: { route_outcome: string; automation_allowed: boolean; escalated_to: string | null }
  fallback: { customer_response: string; internal_summary: string }
}

type LlmOutput = {
  customer_response: string
  internal_summary: string
  model: string
}

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (process.env.OPENAI_LLM_MODE === 'off') return null
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openaiClient
}

export async function generateLLMOutputs(input: LlmInput): Promise<LlmOutput | null> {
  const client = getOpenAIClient()
  if (!client) return null

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 3500)

  const prompt = [
    'You are an operations inbox assistant.',
    'Generate a customer-facing response and an internal summary.',
    'Be concise, professional, and avoid hallucinations.',
    'Use only the provided facts. No markdown.',
    '',
    `Email from: ${input.email.from}`,
    `Received: ${input.email.received_ts}`,
    `Subject: ${input.email.subject}`,
    `Body: ${input.email.body}`,
    `Category: ${input.classification.category}`,
    `Confidence: ${input.classification.confidence}`,
    `Sentiment: ${input.urgency.sentiment}`,
    `Urgency score: ${input.urgency.urgency_score}`,
    `Route: ${input.routing.route_outcome}`,
    `Escalated to: ${input.routing.escalated_to ?? 'none'}`,
    `Extracted entities: ${JSON.stringify(input.extracted)}`,
    '',
    'Return a JSON object with keys:',
    '"customer_response" and "internal_summary".',
    'Do not include any other text.'
  ].join('\n')

  let timeout: ReturnType<typeof setTimeout> | null = null
  try {
    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await client.responses.create(
      {
        model,
        input: prompt
      },
      { signal: controller.signal }
    )
    if (timeout) clearTimeout(timeout)

    const text = response.output_text?.trim()
    if (!text) return null

    const parsed = JSON.parse(text) as { customer_response?: string; internal_summary?: string }
    if (!parsed.customer_response || !parsed.internal_summary) return null

    return {
      customer_response: parsed.customer_response,
      internal_summary: parsed.internal_summary,
      model
    }
  } catch (error) {
    if (timeout) clearTimeout(timeout)
    console.warn('LLM generation failed, falling back to template.', error)
    return null
  }
}
