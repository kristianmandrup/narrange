// perhaps use another jest compliant solution?

const mock = require("mock-fs");
const test1 = `class {
  public void run() {
    var x = 1;
  }
}`;

const test2 = `class {
  public void run() {
    var x = 1;
  }
}`;

mock({
  "fake/dir": {
    "test1.cs": test1,
    dir: {
      "test2.cs": test2
    }
  }
});
