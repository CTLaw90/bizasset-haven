
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
    const { answers } = await req.json();

    // Validate required fields
    const requiredFields = [
      'companyName',
      'productsServices',
      'targetAudience',
      'mainProblem',
      'solution',
      'differentiation',
      'authority',
      'steps'
    ];

    const missingFields = requiredFields.filter(field => !answers[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Based on the provided business information, please complete the following brandscript:

Business Information:
- Company Name: ${answers.companyName}
- Products/Services: ${answers.productsServices}
- Target Audience: ${answers.targetAudience}
- Main Problem: ${answers.mainProblem}
- Solution: ${answers.solution}
- Differentiation: ${answers.differentiation}
- Authority: ${answers.authority}
- Customer Steps: ${answers.steps}

Please create a complete brandscript following this structure:

1. A Character
What do they want?

2. With a problem
External:
Internal:
Philosophical:

3. Meets a guide
Empathy:
Competency & authority:

4. Who give them a plan
Summarize your plan (3 steps):

5. And calls them to action
Affirmation:
Direct:
Marketing:

6a. Success
Successful results:

6b. Failure
Tragic results:

7. Identity transformation
Before:
After:

Please format the response consistently and clearly, making sure to maintain the structure while incorporating all the provided business information naturally.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional brand strategist specialized in creating clear and impactful brandscripts.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const brandscript = data.choices[0].message.content;

    return new Response(JSON.stringify({ brandscript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-brandscript function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
