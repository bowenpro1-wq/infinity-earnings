import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Please visit and summarize the content of this URL: ${url}
      
      Provide a concise summary (2-4 sentences) of what the page is about, its main purpose, and key information. 
      If you cannot access the URL, summarize based on the URL structure and domain.
      Keep the summary informative, neutral, and useful for someone deciding whether to visit the link.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          title: { type: "string" },
          category: { type: "string" }
        }
      }
    });

    return Response.json({ 
      summary: result.summary || "Could not generate summary for this URL.",
      title: result.title || "",
      category: result.category || ""
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});