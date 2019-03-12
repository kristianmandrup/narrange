const exec = require("child_process").exec;
const path = require("path");

const silent = {
  out: process.env.NARRANGE_SILENT_OUT,
  err: process.env.NARRANGE_SILENT_ERR,
  exit: process.env.NARRANGE_SILENT_EXIT
};

const defaults = {
  configFilePath: process.env.NARRANGE_CONFIG_PATH,
  srcPath: process.env.NARRANGE_SRC_PATH,
  silent
};

const rootPath = __dirname;
const libPath = path.join(rootPath, "lib");
const configPath = path.join(rootPath, "config");
const exeFilePath = path.join(rootPath, "lib/narrange.exe");

const paths = {
  configFile: defaults.configFilePath || "config/narrange.xml",
  src: defaults.srcPath || "src",
  exe: exeFilePath,
  config: configPath,
  lib: libPath
};

const error = (msg, { silent } = {}) => {
  silent = silent || defaults.silent;
  if (silent.err) return;
  console.error(msg);
};

const info = (msg, { silent } = {}) => {
  silent = silent || defaults.silent;
  if (silent.out) return;
  console.log(msg);
};

const mainHandler = (err, stdout, stderr) => {
  if (err) {
    error(stderr);
    // should have err.code here?
  }
  info(stdout);
};

const createMainHandler = (opts = {}) => {
  const { onError, onOut, silent } = opts;

  return (err, stdout, stderr) => {
    if (err) {
      if (onError) {
        onError(stderr);
      } else {
        error(stderr, { silent });
      }

      // should have err.code here?
    }
    if (onOut) {
      onOut(stdout);
    } else {
      info(stdout, { silent });
    }
  };
};

const exitHandler = code => {
  if (silent.exit) return;
  if (code !== 0) {
    error("narrange error");
  }

  if (code == 0) {
    info("narrange success");
  }
};

const createExitHandler = (opts = {}) => {
  const { onExitError, onExitSuccess, silent } = opts;

  return code => {
    if (silent.exit) return;
    if (code !== 0) {
      if (onExitError) {
        onError();
      } else {
        error("narrange error", { silent });
      }
    }

    if (code == 0) {
      if (onExitSuccess) {
        onSuccess();
      } else {
        error("narrange success", { silent });
      }
    }
  };
};

const factories = {
  createMainHandler,
  createExitHandler
};

defaults.mainHandler = mainHandler;
defaults.exitHandler = exitHandler;

const createNArrange = (opts = {}) => {
  const createExitHandler =
    opts.createExitHandler || factories.createExitHandler;

  const createMainHandler =
    opts.createMainHandler || factories.createMainHandler;

  const exitHandler = opts.exitHandler || createExitHandler(opts);
  const mainHandler = opts.mainHandler || createMainHandler(opts);

  const srcPath = opts.srcPath || paths.src;
  const configFilePath =
    opts.configFilePath || opts.configPath || paths.configFile;
  const exePath = opts.exePath || paths.exe;

  const narrange = exec(
    `${exePath} ${srcPath} /c:${configFilePath}`,
    mainHandler
  );
  narrange.on("exit", exitHandler);
};

module.exports = {
  createNArrange,
  exitHandler,
  mainHandler,
  createMainHandler,
  createExitHandler,
  info,
  error,
  defaults,
  paths
};
