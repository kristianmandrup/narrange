# NArrange

[NArrange](http://www.narrange.net/) is a .NET code beautifier that automatically organizes code members and elements within .NET classes.

_NArrange_ executes a Windows `.exe` executable (as a child process) and thus only works on a Windows environment.

## Install

Install as a (dev) package dependency:

`npm install narrange -D`

## Quick start

From your node.js script, execute `narrange.exe` in a child process

```js
const { createNArrange } = require("narrange");
const path = require("path");

const { narrange, ctx } = createNArrange({
  srcPath: path.join(__dirname, "src/apps/mango"),
  configFilePath: path.join(__dirname, "config/NArrange.xml")
  // set debug mode
  // debugOn: true
});

console.log(ctx);

narrange();
```

Note that the factory method `createNArrange` returns both `narrange` and a `ctx` context object.
Look at the `ctx` object to ensure you have configured narrange correctly.

During experimentation, pass `debugOn: true` as an option to `createNArrange`

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

Assuming we put the script in a `/scripts` folder in the project root

```js
const { createNArrange } = require("narrange");
const path = require("path");

const rootPath = path.join(__dirname, "../");
const srcPath = path.join(rootPath, "Areas")
const configFilePath = path.join(rootPath, "config/NArrange.xml")

const { narrange } = createNArrange({
  srcPath
  configFilePath
});

narrange();
```

### Tabs configuration

In case you want to convert spaces to tabs, you can use one of the included
configuration files

- `config/Tabs4.xml` converts 4 spaces to 1 tab
- `config/Tabs2.xml` converts 2 spaces to 1 tab

Assuming we put the script in a `/scripts` folder in the project root

```js
const path = require("path");
const rootPath = path.join(__dirname, "../");
const narrangeHomePath = path.join(rootPath, "node_modules/narrange");
const narrangeConfigPath = path.join(narrangeHomePath, "config");
// const narrangeLibPath = path.join(narrangeHomePath, "lib");

const configFilePath = path.join(narrangeConfigPath, "Tabs4.xml")s
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

#### Simple tabs formatting configuration

Simple configuration to force 2 spaces to be converted to a tab:

```js
const { narrange } = createNArrange({
  srcPath: path.join(__dirname, "src/apps/mango"),
  tabs: 4 // use instead of configFilePath to select built in Tabs config file
});
narrange();
```

## createNArrange

The function `createNArrange` creates a child process which executes the `narrange.exe` executable.
`createNArrange` accepts the following options:

- `onError` custom stderr handler function
- `onOut` custom stdout handler function
- `createMainHandler` factory method to create main handler
- `createExitHandler` factory method to create process exit handler
- `createWriters` factory method to create writers (error, info, debug methods)
- `createCommand` factory method to create the command to execute in the child process
- `exitHandler` process exit handler function (takes precedence over factory)
- `mainHandler` main handler function (takes precedence over factory)
- `srcPath` path to input folder for narrange (location folder of source files to process)
- `configFilePath` path to narrange config file
- `exePath` path to narrange exe to override version available in this module
- `tabs` spaces count to tabs used in formatting (used to select built in Tabs config file) - `2` or `4`
- `debugOn` turn debug mode on or off (default: false)

Note that all these options are optional. If any option is left out, a default value is used.

Custom narrange setup example :

```js
const { createNArrange } = require("narrange");
const path = require("path");

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

const { narrange } = createNArrange({
  srcPath: path.join(__dirname, "src/apps/mango"),
  configFilePath: path.join(__dirname, "config/NArrange.xml"),
  createMainHandler,
  onOut,
  onError,
  // tabs: 2 // use instead of configFilePath to select built in Tabs config file
});
narrange();
```

#### Exports

`narrange` exports the following "building blocks":

- `exitHandler` function
- `mainHandler` function
- `createMainHandler` factory function
- `createExitHandler` factory function
- `createWriters` function to create info, error, and debug functions
- `defaults` config object
- `paths` config object

This should make it easy to build a custom narrange solution to suit your needs.

## Full script example

The following example uses [minimist](https://www.npmjs.com/package/minimist) to parse process args passed from shell.

```js
const path = require("path");
const minimist = require('minimist');
const { createNArrange } = require("narrange");
const processArgs = process.argv.slice(2);
const opts = {
  alias: {
    h: 'help',
    s: 'src',
    t: 'tabs'
  }
};

// args is an object, with key for each named argument
const args = minimist(processArgs, opts);
const defaults = {
  srcFolder: "./",
  tabs: 4
}
if (args.help) {
  console.log(`
format-cs
---------
  -s src folder (default: ./ )
  -t spaces per tab (default: 4)
`)
  process.exit(0);
}
const srcFolder = args.src || defaults.srcFolders;
const tabs = args.tabs || defaults.tabs;
const rootPath = path.join(__dirname, "..");
const srcPath = path.join(rootPath, srcFolder),

createNArrange({
  srcPath,
  tabs
});
```

## Tests

You can run some basic tests using [jest](https://jestjs.io)

```bash
$ npm test
```

Note that the executable `narrange.exe` can only be executed on a Windows (perhaps also using Mono?) platform.

## More resources

- [Stack Overflow: Is there a pretty printer / code formatter for C# (as part of build system)?](https://stackoverflow.com/questions/13089911/is-there-a-pretty-printer-code-formatter-for-c-sharp-as-part-of-build-system)

### Recipes

- [Arranging C# project files](http://schmalls.com/2015/01/01/arranging-csproj-files)
- [.NET Source code formatting guide](https://haacked.com/archive/2011/05/22/an-obsessive-compulsive-guide-to-source-code-formatting.aspx/)

[gits: PowerShell - Recurse Project](https://gist.github.com/davidfowl/984358#file-projectitem-recursion)

`Format-Document` PowerShell function which leverages `Recurse-Project` and automates calling into Visual Studio’s Format Document command.

```bash
function Format-Document {
  param(
    [parameter(ValueFromPipelineByPropertyName = $true)]
    [string[]]$ProjectName
  )
  Process {
    $ProjectName | %{
      Recurse-Project -ProjectName $_ -Action
      {
        param($item)
        if($item.Type -eq 'Folder' -or !$item.Language)
        {
          return
        }
        $win = $item.ProjectItem.Open('{7651A701-06E5-11D1-8EBD-00A0C90F26EA}')
        if ($win)
        {
          Write-Host "Processing `"$($item.ProjectItem.Name)`"" [System.Threading.Thread]::Sleep(100) $win.Activate() $item.ProjectItem.Document.DTE.ExecuteCommand('Edit.FormatDocument') $item.ProjectItem.Document.DTE.ExecuteCommand('Edit.RemoveAndSort') $win.Close(1)
        }
      }
    }
  }
}
```

`Format-Document` can be configured for Visual Studio and used to run your existing Format Document command on a subset of project files, using recurse project to iterate and select the files to be processed.

### Extensions

- [VS extension: FormatAllFiles](https://marketplace.visualstudio.com/items?itemName=munyabe.FormatAllFiles)
- [VS extension: NArrangeVS](https://marketplace.visualstudio.com/items?itemName=jthompson-miratech.NArrangeVS)
- [Code formatter](https://github.com/dotnet/codeformatter) (based on Roslyn)

## More docs

See [./Format-CSharp.md] for more details on using narrange directly.

## License

See NArrange license terms
