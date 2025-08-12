import path from "path";
import markdownMagic from "markdown-magic";

const LOG_DETAILS = false;

const config: markdownMagic.Configuration = {};
const callback: markdownMagic.Callback = function (
  updatedContent,
  outputConfig,
) {
  if (LOG_DETAILS) {
    console.log(outputConfig);
    console.log(updatedContent);
  }
  console.log("Finished updating README.md");
};

const markdownPath = path.join(__dirname, "..", "README.md");
markdownMagic(markdownPath, config, callback);
