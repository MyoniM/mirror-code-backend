const { exec } = require("child_process");

const executePython = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python ${filePath}`, (error, stdout, stderr) => {
      stderr && resolve({ data: stderr, stderr: true });
      error && reject({ error, stderr });
      resolve({ data: stdout, stderr: false });
    });
  });
};

module.exports = { executePython };
