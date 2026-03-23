const CodingProblem = require('../models/CodingProblem');

// ── Piston API config ─────────────────────────────────────────
// Piston is a free, open-source code execution engine. No API key needed.
const PISTON_URL = 'https://emkc.org/api/v2/piston';

// Map our language names → Piston language + version
const LANGUAGE_MAP = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  c:          { language: 'c',          version: '10.2.0' },
};

// ── Helper: execute code via Piston API ───────────────────────
async function executeWithPiston(language, code, stdin = '') {
  const lang = LANGUAGE_MAP[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const ext = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c' }[language];
  const filename = language === 'java' ? 'Main.java' : `solution.${ext}`;

  const response = await fetch(`${PISTON_URL}/execute`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang.language,
      version:  lang.version,
      files:    [{ name: filename, content: code }],
      stdin,
      run_timeout:     10000, // 10 seconds
      compile_timeout: 15000,
      run_memory_limit: 128000, // 128MB
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.status}`);
  }

  return await response.json();
}

// ── @route  POST /api/compiler/run
// ── @desc   Run code (free-form, with optional stdin)
// ── @access Private
exports.runCode = async (req, res, next) => {
  try {
    const { language, code, stdin = '' } = req.body;

    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required.' });
    }
    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        success: false,
        message: `Language "${language}" is not supported. Use: ${Object.keys(LANGUAGE_MAP).join(', ')}`,
      });
    }

    const startTime = Date.now();
    const result = await executeWithPiston(language, code, stdin);
    const elapsed = Date.now() - startTime;

    const run     = result.run     || {};
    const compile = result.compile || {};

    // Compilation error?
    if (compile.code !== undefined && compile.code !== 0) {
      return res.json({
        success: true,
        status:  'compile_error',
        output:  '',
        error:   compile.stderr || compile.output || 'Compilation failed.',
        executionTime: null,
      });
    }

    // Runtime error?
    const hasError = run.code !== 0;

    res.json({
      success:       true,
      status:        hasError ? 'runtime_error' : 'success',
      output:        run.stdout || '',
      error:         hasError ? (run.stderr || 'Runtime error.') : '',
      executionTime: `${elapsed}ms`,
    });
  } catch (err) {
    // If Piston is down, return graceful error
    if (err.message && err.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        message: 'Code execution service is temporarily unavailable. Please try again.',
      });
    }
    next(err);
  }
};

// ── @route  POST /api/compiler/submit/:problemId
// ── @desc   Submit solution — runs against all test cases
// ── @access Private
exports.submitSolution = async (req, res, next) => {
  try {
    const { language, code } = req.body;
    const { problemId } = req.params;

    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required.' });
    }

    const problem = await CodingProblem.findById(problemId);
    if (!problem || !problem.isActive) {
      return res.status(404).json({ success: false, message: 'Problem not found.' });
    }

    const testCases = problem.testCases;
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ success: false, message: 'No test cases found for this problem.' });
    }

    // Run against each test case sequentially
    const results = [];
    let passed = 0;

    for (const tc of testCases) {
      try {
        const result = await executeWithPiston(language, code, tc.input);
        const run    = result.run     || {};
        const compile= result.compile || {};

        // Compile error — all test cases fail
        if (compile.code !== undefined && compile.code !== 0) {
          return res.json({
            success:     true,
            status:      'compile_error',
            passed:      0,
            total:       testCases.length,
            error:       compile.stderr || 'Compilation failed.',
            testResults: [],
          });
        }

        const actualOutput   = (run.stdout || '').trim();
        const expectedOutput = (tc.expectedOutput || '').trim();
        const isCorrect      = actualOutput === expectedOutput;

        if (isCorrect) passed++;

        results.push({
          isHidden:       tc.isHidden,
          input:          tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput:   tc.isHidden ? (isCorrect ? '✓ Correct' : '✗ Wrong') : actualOutput,
          passed:         isCorrect,
          error:          run.code !== 0 ? (run.stderr || 'Runtime error') : '',
        });
      } catch {
        results.push({
          isHidden: tc.isHidden,
          input:    tc.isHidden ? '[Hidden]' : tc.input,
          passed:   false,
          error:    'Execution failed',
        });
      }
    }

    const allPassed = passed === testCases.length;

    // Update problem stats
    await CodingProblem.findByIdAndUpdate(problemId, {
      $inc: {
        attemptedBy: 1,
        ...(allPassed ? { solvedBy: 1 } : {}),
      },
    });

    res.json({
      success:     true,
      status:      allPassed ? 'accepted' : 'wrong_answer',
      passed,
      total:       testCases.length,
      percentage:  Math.round((passed / testCases.length) * 100),
      testResults: results,
      message:     allPassed ? '🎉 All test cases passed! Solution accepted.' : `${passed}/${testCases.length} test cases passed.`,
    });
  } catch (err) {
    next(err);
  }
};

// ── @route  GET /api/compiler/languages
// ── @desc   List supported languages
// ── @access Private
exports.getLanguages = (req, res) => {
  res.json({
    success: true,
    languages: Object.keys(LANGUAGE_MAP).map((key) => ({
      id:      key,
      name:    { python: 'Python 3', javascript: 'JavaScript', java: 'Java', cpp: 'C++', c: 'C' }[key],
      version: LANGUAGE_MAP[key].version,
    })),
  });
};
