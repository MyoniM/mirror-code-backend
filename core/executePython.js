const { exec } = require("child_process");

const executePython = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python ${filePath}`, (error, stdout, stderr) => {
      stderr && resolve(stderr);
      error && reject({ error, stderr });
      resolve(stdout);
    });
  });
};

module.exports = { executePython };
