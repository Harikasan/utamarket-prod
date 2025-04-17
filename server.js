const http = require("http");
const { handleSignup } = require("./api/auth/signup");

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle signup endpoint
  if (req.method === "POST" && req.url === "/api/auth/signup") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const userData = JSON.parse(body);
        const result = await handleSignup(userData);

        res.writeHead(result.statusCode, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(result.body));
      } catch (error) {
        console.error("Error processing request:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Internal server error",
            error: "An unexpected error occurred",
          })
        );
      }
    });
  } else {
    // Handle 404 for other routes
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
