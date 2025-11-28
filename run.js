
const { spawn } = require('child_process');

function runCommand(command, args, cwd) {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: true });

    child.on('error', (error) => {
        console.error(`Error in ${command} in ${cwd}: ${error}`);
    });

    child.on('exit', (code) => {
        console.log(`${command} in ${cwd} exited with code ${code}`);
    });
}

// Start backend
console.log("Starting backend...");
runCommand('npm', ['run', 'dev'], 'backend');

// Start frontend
console.log("Starting frontend...");
runCommand('npm', ['start'], 'frontend');
