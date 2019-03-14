const exec = require("child_process").exec;
const path = require("path");
var fs = require("fs");

const isFunction = fun => {
  return typeof fun == "function";
};

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
  src: defaults.srcPath || ".",
  narrange: {
    exe: exeFilePath,
    config: configPath,
    lib: libPath
  }
};

const createWriters = (opts = {}) => {
  let { silent, writer, debugOn } = opts;
  silent = silent || defaults.silent || {};
  writer = writer || console;

  const error = msg => {
    if (silent.err) return;
    if (isFunction(writer.error)) {
      writer.error(msg);
    }
  };

  const info = msg => {
    if (silent.out) return;
    if (isFunction(writer.log)) {
      writer.log(msg);
    }
  };

  const debug = msg => {
    if (!debugOn) return;
    if (isFunction(writer.log)) {
      writer.log(msg);
    }
  };

  return {
    error,
    info,
    debug
  };
};

const mainHandler = (err, stdout, stderr) => {
  if (err) {
    console.error(stderr);
    // should have err.code here?
  }
  console.log(stdout);
};

const createMainHandler = (opts = {}) => {
  const { onError, onOut } = opts;
  const { error, info } = createWriters(opts);

  return (err, stdout, stderr) => {
    if (err) {
      if (onError) {
        onError(stderr);
      } else {
        error(stderr);
      }

      // should have err.code here?
    }
    if (onOut) {
      onOut(stdout);
    } else {
      info(stdout);
    }
  };
};

const exitHandler = (code, silent = {}) => {
  if (silent.exit) return;
  if (code !== 0) {
    error("narrange error");
  }

  if (code == 0) {
    info("narrange success");
  }
};

const createExitHandler = (opts = {}) => {
  const { onExitError, onExitSuccess, done, silent = {} } = opts;
  const { error } = createWriters(opts);

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

    if (isFunction(done)) {
      done(code);
    }
  };
};

const factories = {
  createMainHandler,
  createExitHandler
};

const createCommand = (exePath, srcPath, opts = {}) => {
  const configArg = opts.config || "";
  return `${exePath} ${srcPath} ${configArg}`;
};

defaults.createCommand = createCommand;
defaults.createWriters = createWriters;
defaults.mainHandler = mainHandler;
defaults.exitHandler = exitHandler;

const pathExists = fullPath => {
  return fs.existsSync(fullPath);
};

const narrangeConfigFilePathFor = (opts = {}) => {
  const { tabs } = opts;
  if (tabs) {
    return path.join(paths.narrange.config, `Tabs${tabs}.xml`);
  }
  // expect narrange to use default strategy if empty
  return "";
};

const getConfigFilePath = (opts = {}, paths = {}) => {
  let configFilePath =
    opts.configFilePath || opts.configPath || paths.configFile;

  if (!pathExists(configFilePath)) {
    configFilePath = narrangeConfigFilePathFor(opts);
  }
  return configFilePath;
};

const isNothing = obj => {
  return obj === undefined || obj === null;
};

const notEmptyStr = obj => {
  return !isNothing(obj) && obj.trim() !== "";
};

const createNArrange = (opts = {}) => {
  const createExitHandler =
    opts.createExitHandler || factories.createExitHandler;

  const createMainHandler =
    opts.createMainHandler || factories.createMainHandler;

  const exitHandler = opts.exitHandler || createExitHandler(opts);
  const mainHandler = opts.mainHandler || createMainHandler(opts);

  const srcPath = opts.srcPath || paths.src;
  const configFilePath = getConfigFilePath(opts, paths);

  const exePath = opts.exePath || paths.narrange.exe;
  const createWriters = opts.createWriters || defaults.createWriters;

  const { debug } = createWriters(opts);

  const configArg = notEmptyStr(configFilePath) ? `/c:${configFilePath}` : "";

  const createCommand = opts.createCommand || defaults.createCommand;
  const command = createCommand(exePath, srcPath, { config: configArg });

  const ctx = {
    command: {
      full: command,
      exe: exePath,
      args: {
        config: configArg,
        src: srcPath
      }
    },
    paths: {
      exe: exePath,
      config: configFilePath,
      src: srcPath
    },
    handlers: {
      main: mainHandler,
      exit: exitHandler
    }
  };

  debug({ ctx });

  const narrange = () => {
    debug({ command });

    const childProcess = exec(command, mainHandler);
    childProcess.on("exit", exitHandler);
    return childProcess;
  };

  return {
    narrange,
    ctx
  };
};

module.exports = {
  createNArrange,
  exitHandler,
  mainHandler,
  createMainHandler,
  createExitHandler,
  createWriters,
  defaults,
  paths
};
