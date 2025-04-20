export default {
    async fetch(request, env) {
      const { DB } = env;
      const urlObj = new URL(request.url);
      const searchParams = urlObj.searchParams;
      const url = searchParams.get("url");
      const addLikes = parseInt(searchParams.get("likes") || "0", 10);
  
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "*"
      };
  
      if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }
  
      if (!url) {
        return new Response(JSON.stringify({ error: "Missing url param" }), { status: 400, headers: corsHeaders });
      }
  
      let result = await DB.prepare("SELECT likes FROM likes WHERE url = ?").bind(url).first();
      let likes = result?.likes ? parseInt(result.likes) : 0;
      let hasRow = !!result;
  
      if (addLikes > 0) {
        if (hasRow) {
          likes += addLikes;
          await DB.prepare("UPDATE likes SET likes = ? WHERE url = ?").bind(likes, url).run();
        } else {
          likes = addLikes;
          await DB.prepare("INSERT INTO likes (url, likes) VALUES (?, ?)").bind(url, likes).run();
        }
      } else {
        if (!hasRow) {
          likes = 1;
          await DB.prepare("INSERT INTO likes (url, likes) VALUES (?, ?)")
            .bind(url, likes)
            .run();
        }
      }
  
      return new Response(JSON.stringify({ likes }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }