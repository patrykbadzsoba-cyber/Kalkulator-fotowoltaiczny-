const path = require("node:path");
const { DefaultArtifactClient } = require("@actions/artifact");

async function main() {
  const artifactPath = path.join(process.env.RUNNER_TEMP || "", "artifact.tar");
  const client = new DefaultArtifactClient();
  const result = await client.uploadArtifact("github-pages", [artifactPath], {
    retentionDays: 1
  });
  if (!result || !result.id) {
    throw new Error("GitHub Pages artifact upload did not return an artifact ID.");
  }
  console.log("Uploaded GitHub Pages artifact " + result.id + " (" + result.size + " bytes).");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
