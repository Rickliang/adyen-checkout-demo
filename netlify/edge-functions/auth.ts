import type { Context } from "https://edge.netlify.com";

const PASSWORD = "adyen";

export default async (request: Request, context: Context) => {
  const auth = request.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic") {
      const decoded = atob(encoded);
      const [, pwd] = decoded.split(":");
      if (pwd === PASSWORD) {
        return context.next();
      }
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Adyen Checkout Demo"',
    },
  });
};

export const config = { path: "/*" };
