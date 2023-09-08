const sass = require("sass");
const path = require("node:path");
const browserslist = require("browserslist");
const { transform, browserslistToTargets } = require("lightningcss");

module.exports = (eleventyConfig) => {
   // Recognize Sass as a "template languages"
   eleventyConfig.addTemplateFormats("sass");
   // Compile Sass
   eleventyConfig.addExtension("sass", {
      outputFileExtension: "css",
      compile: async function (inputContent, inputPath) {
         // Skip files like _fileName.scss
         let parsed = path.parse(inputPath);
         if (parsed.name.startsWith("_")) {
            return;
         }

         // Run file content through Sass
         let result = sass.compileString(inputContent, {
            loadPaths: [parsed.dir || "."],
            sourceMap: true, // or true, your choice!,
            syntax: "indented", // ! .SASS files don't work without this line
         });

         // Allow included files from @use or @import to
         // trigger rebuilds when using --incremental
         this.addDependencies(inputPath, result.loadedUrls);

         let targets = browserslistToTargets(browserslist("defaults"));

         return async () => {
            let { code } = await transform({
               code: Buffer.from(result.css),
               minify: true,
               sourceMap: true,
               targets,
            });
            return code;
         };
      },
   });

   eleventyConfig.addPassthroughCopy({
      "node_modules/@fontsource-variable/fraunces": "assets/fonts/fraunces",
      "src/static": ".",
   });

   return {
      dir: {
         input: "./src",
         output: "./dist",
      },
   };
};
