import { NodePlopAPI } from "plop";
import { index, pjson, tsconfig, rushjson, templates } from "./constants";
import { join } from "path";

export default (plop: NodePlopAPI) => {
  plop.addHelper("to_module", (category, name) => {
    if (category === "apps") return name;
    else if (category === "libs") return `lib-${name}`;
    else return `${category}-${name}`;
  });

  plop.addHelper("to_review", (category) => {
    switch (category) {
      case "apps":
        return "productions";
        break;
      case "libs":
        return "libraries";
        break;
      case "dev":
        return "developments";
        break;
      default:
        return "prototypes";
    }
  });

  // create your generators here
  plop.setGenerator("module", {
    description: "application controller logic",
    prompts: [
      {
        type: "list",
        name: "category",
        message: "modules category",
        choices: ["apps", "libs", "dev"],
      },
      {
        type: "input",
        name: "name",
        message: "module name",
        validate: (i, a) => /[a-z0-9\-]/.test(i),
      },
      {
        type: "input",
        name: "description",
        message: "module description",
        validate: (i, a) => /[a-z0-9 ]/.test(i),
      },
    ],
    actions: [
      {
        type: "add",
        path: index,
        templateFile: join(templates, "modules", "index.hbs"),
      },
      {
        type: "add",
        path: pjson,
        templateFile: join(templates, "modules", "package.hbs"),
      },
      {
        type: "add",
        path: tsconfig,
        templateFile: join(templates, "modules", "tsconfig.hbs"),
      },
      {
        type: "append",
        pattern: "/*APPEND_HERE*/",
        path: rushjson,
        templateFile: join(templates, "modules", "rushjson.hbs"),
      },
    ],
  });
};