const { createNArrange } = require("..");

// jest.setTimeout(10000);
describe("NArrange", () => {
  describe("createNArrange", () => {
    test("is a function", () => {
      expect(typeof createNArrange === "function");
    });

    test("is a function", () => {
      expect(typeof createNArrange === "function");
    });

    test("when factory called does not throw", () => {
      expect(() => createNArrange()).not.toThrow();
    });

    describe("narrange", () => {
      const { narrange } = createNArrange();
      test("is a function", () => {
        expect(typeof narrange === "function");
      });

      test("when called does not throw", done => {
        expect(() =>
          narrange({
            done,
            debug: true
          })
        ).not.toThrow();
      });
    });
  });

  describe.skip("formats files according to config", () => {});
});
