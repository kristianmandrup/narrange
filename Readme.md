# NArrange

[NArrange](http://www.narrange.net/) is a .NET code beautifier that automatically organizes code members and elements within .NET classes.

## Install

`npm install narrange`

## Usage

From your node.js script, execute `narrange.exe` in a childprocess (Windows or using [Mono](https://www.mono-project.com/) for non-Windows).

```js
const exec = require("child_process").exec;

const configFilePath = `config/NArrange-Config.xml`;

const exePath = `${__dirname}/node_modules/narrange/lib/narrange.exe`;
const narrange = exec(`${exePath} src /c:${configFilePath}`, function(
  err,
  stdout,
  stderr
) {
  if (err) {
    console.log(stderr);
    // should have err.code here?
  }
  console.log(stdout);
});

narrange.on("exit", function(code) {
  // exit code is code
  console.log(`EXIT: ${code}`);
});
```

## Default implementation

A default implementation is included and can be used as follows:

```js
import { createNArrange } from "narrange";

createNArrange({
  srcPath: path.join(__dirname, "src/apps/mango"),
  configFilePath: path.join(__dirname, "config/NArrange.xml")
});
```

## Pre-commit hooks

You can use this recipe to integrate NArrange with git hooks, such as `pre-commit` hooks:

- Setup git hooks via husky
- Create node script to trigger on hook

### Setup hooks

Install and setup [husky](https://www.npmjs.com/package/husky)

Add the following to your `package.json` file (or create a new one using `npm init`)

```js
{
  "devDependencies": {
    "narrange": "~1.0.0"
    "husky": "~1.3.1"
  },
  "husky": {
    "hooks": {
      "pre-commit": "node format-csharp.js"
    }
  }
}
```

Run `npm install` from your Terminal to install dependencies: `husky` and `narrange`

### Create node script

Create a Node script `format-csharp.js` that runs `narrange.exe` on your source files using
a config file with your specific preferences.

```js
import { createNArrange } from "narrange";

const srcPath = path.join(__dirname, "src/apps/mango")
const configFilePath = path.join(__dirname, "config/NArrange.xml")

createNArrange({
  srcPath
  configFilePath
});
```

### Tabs configuration

In case you want to convert spaces to tabs, you can use one of the included
configuration files

- `config/Tabs4.xml` converts 4 spaces to 1 tab
- `config/Tabs2.xml` converts 2 spaces to 1 tab

```js
const narrangeHomePath = path.join(__dirname, "node_modules/narrange");
const narrangeConfigPath = path.join(narrangeHomePath, "config");
// const narrangeLibPath = path.join(narrangeHomePath, "lib");

const configFilePath = path.join(narrangeConfigPath, "Tabs4.xml")`
```

#### Formatting

To create your own formatting rules, by specifying your own rules in the `<Formatting>` section on the config file. Use any of the files included in `config` or `lib` folders of this package.

```xml
<Formatting>
    <Tabs Style="Tabs" SpacesPerTab="2"/>
    <ClosingComments Enabled="false" Format="End $(ElementType) $(Name)"/>
    <Regions Style="NoDirective" />
    <Usings MoveTo="Namespace"/>
    <LineSpacing RemoveConsecutiveBlankLines="true" />
</Formatting>
```

Note that you can use the `narrange-config.exe` to edit a configuration file using a GUI, which ensures you can only populate it with valid values.

For more details, see [./Format-CSharp.md]

## createNArrange

The function `createNArrange` creates a child process which executes the `narrange.exe` executable.
`createNArrange` accepts the following options:

- `onError` custom stderr handler function
- `onOut` custom stdout handler function
- `createMainHandler` factory method to create main handler
- `createExitHandler`
- `exitHandler` exit handler function (precedence over factory)
- `mainHandler` main handler function (precedence over factory)
- `srcPath` path to input folder for narrange (location folder of source files to process)
- `configFilePath` path to narrange config file
- `exePath` path to narrange exe to override version available in this module

Note that all these options are optional. If any option is left out, a default value is used.

Custom narrange setup example :

```js
const createMainHandler = (opts = {}) => {
  return (err, stdout, stderr) => {
    // ..
    if (err) {
      opts.onError(err);
    }
  };
};

const onError = (err) {
  console.error(err);
}

createNArrange({
  srcPath: path.join(__dirname, "src/apps/mango"),
  configFilePath: path.join(__dirname, "config/NArrange.xml"),
  createMainHandler,
  onOut,
  onError
});
```

#### Exports

`narrange` exports the following "building blocks":

```
exitHandler,
mainHandler,
createMainHandler,
createExitHandler,
info,
error,
defaults,
paths
```

This should make it easy to build a custom narrange solution to suit your needs.

## License

See NArrange license terms
