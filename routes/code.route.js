const router = require("express").Router();
const code = require("../controllers/code.controller");

router.post("/run-code", code.runCode);

module.exports = router;
