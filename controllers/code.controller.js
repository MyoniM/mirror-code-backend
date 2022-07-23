const { executePython } = require("../core/executePython");
const { generateFile } = require("../generateFile");

const runCode = async (req, res) => {
  const { language = "python", document } = req.body;
  if (document == undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Empty document body." });
  }
  try {
    const filePath = generateFile(language, document);
    const output = await executePython(filePath);
    return res.json({ success: true, output });
  } catch (_) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { runCode };
