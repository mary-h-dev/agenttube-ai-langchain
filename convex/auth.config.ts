if (!process.env.CLERK_ISSUER_URL) {
  throw new Error("CLERK_ISSUER_URL environment variable is not defined");
}

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ],
};