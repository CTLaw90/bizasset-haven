
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandscript, personas } = await req.json();

    if (!brandscript) {
      throw new Error('Brandscript is required');
    }

    const prompt = `Context Setting
You are tasked with generating 30 authentic problem statements based on the provided brandscript and optional customer personas. These statements should reflect genuine pain points, aspirations, and concerns that lead potential customers to seek our solution.

Input Data:

Brandscript:
${brandscript}

${personas ? `Customer Personas:\n${personas}` : ''}

Output Requirements:
Generate 30 diverse first-person problem statements that:
- Directly reflect the problems identified in the brandscript
- ${personas ? 'Align with the specific challenges and aspirations of provided personas' : 'Align with the target market described in the brandscript'}
- Vary in emotional intensity and urgency
- Sound natural and conversational
- Are concise and ad-copy ready (no more than 15 words each)
- Connect logically to the solution offered

Use these problem statement formats:
- Personal struggles ("I keep falling behind on...")
- Emotional expressions ("I'm frustrated trying to...")
- Questions ("Why can't I figure out...")
- Direct pain points ("I'm tired of dealing with...")
- Aspirational concerns ("I wish I could...")
- Time-based issues ("I never have enough time to...")
- Cost-related problems ("I'm wasting money on...")
- Quality complaints ("I can't stand how unreliable...")
- Future worries ("I'm concerned about falling behind...")
- Social comparison ("Everyone else seems to know...")

Special Instructions:
- Write all statements in first person
- Each statement should stand alone as a complete thought
- Vary the emotional intensity from mild concern to urgent need
- Mirror the language and tone of the target market
- Reference industry-specific challenges when relevant
- Include both immediate and long-term concerns
- Balance rational and emotional appeals
- Ensure statements naturally lead to the solution offered in the brandscript

Format your response as a simple array of strings, with each string being a problem statement. DO NOT include any JSON formatting marks like quotes around the array itself or 'json' keyword. Just provide the clean array.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a marketing expert specializing in understanding customer pain points and creating compelling problem statements.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    let problem_statements: string[];
    
    try {
      // Clean up the response by removing all JSON formatting artifacts
      const content = data.choices[0].message.content;
      const cleanedContent = content
        .replace(/^```json\s*/, '')    // Remove opening ```json
        .replace(/```$/g, '')          // Remove closing ```
        .replace(/^\s*\[\s*/, '')      // Remove opening [
        .replace(/\s*\]\s*$/, '')      // Remove closing ]
        .trim()
        .split(',\n')                  // Split into array by commas followed by newlines
        .map(line => line
          .trim()                      // Trim whitespace
          .replace(/^["']|["']$/g, '') // Remove quotes
          .replace(/,$/g, '')          // Remove trailing commas
        )
        .filter(line => line);         // Remove empty lines

      problem_statements = cleanedContent;
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // If parsing fails, try to extract statements from the text response
      problem_statements = data.choices[0].message.content
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, ''));
    }

    return new Response(JSON.stringify({ problem_statements }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-problem-statements function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
