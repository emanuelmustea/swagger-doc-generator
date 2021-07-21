const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "/");

function readSync(dirName) {
  return fs.readdirSync(path.join(root, dirName));
}
function filter(files, extensions) {
  return files.filter((el) => extensions.includes(path.extname(el)));
}

function getAllFilesWithExtensions(dirName, extensions) {
  const files = readSync(dirName);
  const filteredList = filter(files, extensions).map(
    (file) => `${dirName}${file}`
  );
  const directories = files.filter(
    (el) => path.extname(el) === "" && !el.startsWith(".")
  );
  if (directories.length) {
    return directories.reduce((totalArray, currentDir) => {
      return [
        ...totalArray,
        ...getAllFilesWithExtensions(`${dirName}${currentDir}/`, extensions),
      ];
    }, filteredList);
  }
  return filteredList;
}

const allSwaggerFiles = getAllFilesWithExtensions("/", [".yaml", ".yml"]);

const formattedSwaggerFiles = allSwaggerFiles.map(
  (path) =>
    `{ url: location.protocol + '//' + location.host + "${path}", name: "${path}" }`
);

const htmlContent = `

<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.0.0-beta.0/swagger-ui.css" />
    <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
    <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.0.0-beta.0/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.0.0-beta.0/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
      
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        "dom_id": "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        validatorUrl: "https://validator.swagger.io/validator",
        urls: [
          ${formattedSwaggerFiles.join(",")}
      ],  
      "urls.primaryName": "${allSwaggerFiles[0]}", 
      })
      
      // End Swagger UI call region


      window.ui = ui;
    };
  </script>
  </body>
</html>

`;

fs.writeFile("index.html", htmlContent, function (err) {
  if (err) return console.log(err);
});
