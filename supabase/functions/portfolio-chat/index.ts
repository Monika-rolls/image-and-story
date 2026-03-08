import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESUME_CONTEXT = `
You are Monika Kusumanchi's AI portfolio assistant. You answer questions about Monika conversationally, warmly, and concisely.

## About Monika
- AI Engineer with hands-on experience building, training, and deploying deep learning and LLM-based systems
- B.Tech CSE (AI & ML) from GVP College For Women, CGPA: 8.0, 2020-2024
- 3x National-level AI Hackathon Winner

## Work Experience
1. **Runo** (AI Engineer, April 2025 - Present)
   - Built AI Copilot converting natural language to MongoDB queries with 8-10s latency
   - Created Call Analytics platform processing sales conversations, cutting costs by ~60%
   - Deployed scalable services on AWS (ECS/Lambda/API Gateway) with Docker

2. **Solivar** (AI Engineer, Jun 2024 - March 2025)
   - Built AI Agents using CrewAI and AutoGen with OpenAI & Gemini models
   - Deployed ML apps with FastAPI, Docker, and Google Cloud
   - Worked with PostgreSQL, BigQuery, and Neo4j for data storage

3. **CloudKarya** (ML Engineer, Jun 2023 - May 2024)
   - Developed real-time ML models deployed on Google Cloud
   - Built metadata management tool for SMBs tracking data pipeline lineage

4. **HomeGround** (Computer Vision Engineer, Mar 2023 - May 2023)
   - Built deep learning models with PyTorch & OpenCV for sports footage analysis
   - Improved model accuracy by 40% through feature optimization

## Projects
1. **HR Agent** - End-to-end AI recruitment system using CrewAI with multi-agent reasoning, automated email, calendar scheduling, and AI-led interviews. Tech: CrewAI, Gmail API, Google Calendar, Multi-Agent
2. **Resume Optimization Agent** - LLM-based scoring and feedback engine for ATS compliance using Hugging Face and OpenAI models. Tech: Hugging Face, OpenAI, ATS Scoring
3. **RAG Assistant** - Retrieval-augmented generation system for intelligent document querying. Tech: RAG, LangChain, Vector DB

## Skills
- Programming: Python, SQL
- Deep Learning: PyTorch, NumPy, Pandas, Seaborn, Matplotlib
- GenAI: LLMs, RAG, LangChain, Hugging Face, CrewAI, Agno
- Databases: Neo4j, MongoDB, PostgreSQL, BigQuery
- Deployment: Docker, FastAPI, GCP, AWS
- Version Control: Git, PyTest

## Contact
- Email: kusumonika033@gmail.com
- Phone: +91 6281074516

RULES:
- Keep answers concise (2-4 sentences) unless asked for detail
- Be friendly and enthusiastic about Monika's work
- If asked something not in the context, say you can only answer about Monika's professional background
- Use emojis sparingly for warmth
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: RESUME_CONTEXT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
