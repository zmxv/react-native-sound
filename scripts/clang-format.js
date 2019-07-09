const { promisify } = require("util");
const path = require("path");
const glob = promisify(require("glob"));
const { spawn } = require("promisify-child-process");

const projectDir = path.join(__dirname, "..");

async function getSourceFiles() {
  return glob("RNSound/*.[hm]", {
    cwd: projectDir
  });
}

async function format() {
  const sourceFiles = await getSourceFiles();
  await spawn(
    "clang-format",
    ["-i", ...sourceFiles.map(file => path.join(projectDir, file))],
    { encoding: "utf8" }
  );
}

async function check() {
  const badFiles = [];
  for (sourceFile of await getSourceFiles()) {
    const { stdout } = await spawn(
      "clang-format",
      ["-output-replacements-xml", path.join(projectDir, sourceFile)],
      { encoding: "utf8" }
    );
    if (stdout.includes("offset")) {
      badFiles.push(sourceFile);
    }
  }

  if (badFiles.length) {
    console.error("The following source files contain formatting issues.\n");
    badFiles.forEach(filename => {
      console.error(` - ${filename}`);
    });
    console.error(
      "\nPlease install `clang-format` and run `yarn clang-format` to fix them."
    );
    process.exit(1);
  } else {
    console.error("All source files are formatted correctly.");
  }
}

async function main() {
  const isCheck = process.argv[2] === "--check";
  if (isCheck) {
    await check();
  } else {
    await format();
  }
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
