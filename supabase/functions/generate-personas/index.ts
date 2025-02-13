
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
    const { brandscript, businessInfo } = await req.json();

    const prompt = `Based on the following BrandScript and business information, generate three distinct customer personas that represent the target audience for this business.

BrandScript:
${brandscript}

Business Information:
${Object.entries(businessInfo)
  .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`)
  .join('\n')}

Based on the provided BrandScript and business information, generate three distinct customer personas that represent the target audience for this business. Each persona should be detailed and realistic, reflecting different segments of the market that would benefit from the described services.
For each persona, provide:

Basic Demographics
- Full name
- Age
- Location (considering the business's service area)
- Income level
- Industry
- Current role/position
- Company size (if applicable)
- Education level
- Family status

Professional Context
- Years of business experience
- Size of team they manage (if applicable)
- Annual marketing budget
- Current marketing challenges
- Previous experience with marketing services
- Decision-making authority level

Psychological Profile
- Primary business goals
- Personal aspirations
- Core values
- Communication preferences
- Decision-making style
- Risk tolerance
- Technology adoption level

Pain Points & Frustrations
- Current marketing-related challenges
- Time constraints
- Resource limitations
- Specific industry pressures
- Competition concerns
- Team-related challenges

Desires & Motivations
- Immediate business needs
- Long-term vision
- Definition of success
- Expected outcomes from marketing services
- Return on investment expectations
- Timeline expectations

Buying Behavior
- Information gathering process
- Preferred communication channels
- Key decision-making factors
- Budget sensitivity
- Service preferences
- Typical objections
- Trust indicators they look for

For each persona, write a brief narrative that brings their story to life, explaining how they discovered they needed marketing help and what specific aspects of the business's services would appeal to them.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are a marketing expert specialized in creating detailed customer personas based on business information and brandscripts.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const personas = data.choices[0].message.content;

    return new Response(JSON.stringify({ personas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-personas function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
