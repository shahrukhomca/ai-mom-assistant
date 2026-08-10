export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url);
    
    if (url.pathname === "/chat" && request.method === "POST") {
      const body = await request.json();
      const userMessage = body.messages?.[body.messages.length - 1]?.content || "Hello";
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }]
          }),
        }
      );
      
      const geminiData = await response.json();
      
      if (geminiData.error) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: "Gemini Error: " + geminiData.error.message } }]
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      if (!geminiData.candidates || geminiData.candidates.length === 0) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: "Debug: " + JSON.stringify(geminiData) } }]
        }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      const reply = geminiData.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({
        choices: [{ message: { content: reply } }]
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("AI Mom Guide Proxy is running. Use POST /chat endpoint.", { status: 200 });
  },
};
