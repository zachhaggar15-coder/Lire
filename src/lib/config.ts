/** Deployment facts shared by server and client code. Contains no secrets. */

export type DeploymentEnvironment = "local" | "preview" | "production";

export function deploymentEnvironment(): DeploymentEnvironment {
  const explicit = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV;
  if (explicit === "production" || explicit === "preview" || explicit === "local") return explicit;
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  return "local";
}

export function appVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local";
}

export function productionDomain(): string {
  return process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || "https://sorlio.site";
}
