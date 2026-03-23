const express = require("express");
const runCode = require("../compiler");

const router = express.Router();

router.post("/submit-code", (req, res) => {
    const { code, language = 'python' } = req.body;

    runCode(language, code, '', (output) => {
        res.json({
            result: output
        });
    });
});

module.exports = router;