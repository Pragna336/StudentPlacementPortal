const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(exec);

const TEMP_DIR = path.join(__dirname, 'temp_executions');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

/**
 * Local Code Executor
 * Uses locally installed compilers/interpreters (python, node, javac, g++, gcc)
 */
async function runCode(language, code, stdin = '') {
  const id = Date.now() + '_' + Math.floor(Math.random() * 1000);
  const workDir = path.join(TEMP_DIR, id);
  fs.mkdirSync(workDir);

  const extMap = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c' };
  const ext = extMap[language] || 'txt';
  const filename = language === 'java' ? 'Main.java' : `solution.${ext}`;
  const filePath = path.join(workDir, filename);

  try {
    fs.writeFileSync(filePath, code);

    let command = '';
    let compileCommand = '';
    let binaryPath = '';

    switch (language) {
      case 'python':
        // Try 'python' then 'python3'
        command = `python ${filename}`;
        break;
      case 'javascript':
        command = `node ${filename}`;
        break;
      case 'java':
        compileCommand = `javac ${filename}`;
        command = `java Main`;
        break;
      case 'cpp':
        binaryPath = process.platform === 'win32' ? 'solution.exe' : './solution';
        compileCommand = `g++ ${filename} -o ${binaryPath}`;
        command = binaryPath;
        break;
      case 'c':
        binaryPath = process.platform === 'win32' ? 'solution.exe' : './solution';
        compileCommand = `gcc ${filename} -o ${binaryPath}`;
        command = binaryPath;
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    // 1. Compile if needed
    if (compileCommand) {
      try {
        await execPromise(compileCommand, { cwd: workDir, timeout: 15000 });
      } catch (compileErr) {
        return {
          success: true,
          status: 'compile_error',
          output: (compileErr.stderr || compileErr.message).trim(),
          exitCode: 1
        };
      }
    }

    // 2. Run
    return new Promise((resolve) => {
      const processName = command.split(' ')[0];
      const args = command.split(' ').slice(1);
      
      const child = spawn(processName, args, { 
        cwd: workDir,
        timeout: 10000 
      });

      let stdout = '';
      let stderr = '';

      if (stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('error', (err) => {
        resolve({
          success: false,
          status: 'error',
          message: `Failed to start ${language} execution. Ensure '${processName}' is installed and in your PATH. \nDetails: ${err.message}`
        });
      });

      child.on('close', (code) => {
        const hasError = code !== 0 && code !== null;
        resolve({
          success: true,
          status: hasError ? 'runtime_error' : 'success',
          output: hasError ? (stdout + '\n' + stderr).trim() : stdout.trim(),
          stdout: stdout,
          stderr: stderr,
          exitCode: code
        });
      });

      // Simple timeout guard
      setTimeout(() => {
        child.kill();
        resolve({
          success: true,
          status: 'runtime_error',
          output: 'Time Limit Exceeded (10s)'
        });
      }, 11000);
    });

  } catch (err) {
    return { 
      success: false, 
      status: 'error', 
      message: err.message 
    };
  } finally {
    // Cleanup files eventually (async, non-blocking)
    const folderToClean = workDir;
    setTimeout(() => {
      try {
        if (fs.existsSync(folderToClean)) {
          fs.rm(folderToClean, { recursive: true, force: true }, (err) => {
            if (err) console.log('Non-critical cleanup warning:', err.message);
          });
        }
      } catch (err) { }
    }, 10000);
  }

}

module.exports = runCode;
