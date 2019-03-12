# Format Csharp code

Uses [husky](https://www.npmjs.com/package/husky) to add git pre-commit hooks via node.js.

## Configuration

```js
  "husky": {
    "hooks": {
      "pre-commit": "node format-csharp.js"
    }
  },
```

### NArrange

`format-csharp.js` executes [NArrange](http://www.narrange.net/doc/index.htm) in a child process

### Formatting configuration

Configuration file: `config/NArrange-Config.xml`

NArrange comes with a default config file. The only change is:

```xml
<Tabs Style="Tabs" SpacesPerTab="4"/>
```

To disable regions, use `Style="NoDirective"`

```xml
<Regions Style="NoDirective" />
```

```bash
$ narrange/narrange.exe src /c:config/NArrange-Config.xml
```

You can use the `narrange/narrange-config.exe` to edit an `.xml` configuration file.

![NArrange configuration](./images/NArrange-configuration.png "NArrange configuration")

## Usage

```bash
test-cs> git commit -am "spaces"
husky > pre-commit (node v10.15.3)
EXIT: 0

NArrange 0.2.9.0
____________________________________________________________
Copyright (C) 2007-2009 James Nies and NArrange contributors.
All rights reserved.
http://www.NArrange.net

Zip functionality courtesy of ic#code (Mike Krueger, John Reilly).

Parsing files...
2 files parsed.
Writing files...
2 files written.
Arrange successful.

[master 13a2147] spaces
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Beautiful :)
