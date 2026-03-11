document.addEventListener('DOMContentLoaded', function () {
  // Initialize the card terminal
  initTerminal({
    inputId: 'nc-terminal-input',
    outputId: 'nc-terminal-output'
  });

  // Initialize the modal terminal
  initTerminal({
    inputId: 'nc-terminal-input-modal',
    outputId: 'nc-terminal-output-modal'
  });

  // Modal functionality
  const compilerCard = document.querySelector('.nc-card-compiler');
  const modal = document.getElementById('compiler-modal');
  const closeBtn = document.getElementById('compiler-modal-close');

  // Open modal when clicking on compiler card
  compilerCard.addEventListener('click', function () {
    modal.classList.add('active');
    document.getElementById('nc-terminal-input-modal').focus();
  });

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function () {
    modal.classList.remove('active');
  });

  // Close modal when clicking outside the modal content
  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
});

// Refactored terminal initialization function
function initTerminal(options) {
  const terminalInput = document.getElementById(options.inputId);
  const terminalOutput = document.getElementById(options.outputId);

  // Command history for this terminal instance
  let commandHistory = [];

  // Available commands
  const commands = {
    help: () => {
      return `Available commands:<br>
• help - Show this help message<br>
• clear - Clear the terminal<br>
• about - About this compiler<br>
• date - Show current date and time<br>
• echo [text] - Echo the provided text<br>
• ipconfig - Display network configuration information<br>
• whoami - Display current user<br>
• calc [expression] - Calculate a mathematical expression<br>
• history - Show command history<br>
• joke - Get a random joke`;
    },
    clear: () => {
      terminalOutput.innerHTML = '';
      return '';
    },
    about: () => {
      return `Web Terminal v1.0<br>A fun terminal interface in your browser.<br>Created with ❤️ by Asit Waghmare`;
    },
    date: () => {
      return new Date().toString();
    },
    echo: (args) => {
      return args.join(' ');
    },
    ipconfig: () => {
      fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
          const ipConfigLine = document.createElement('div');
          ipConfigLine.className = 'nc-terminal-line';
          ipConfigLine.innerHTML = `
                        <pre> IP Address : ${data.ip} </pre>
                    `;
          terminalOutput.appendChild(ipConfigLine);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        })
        .catch(error => {
          const errorLine = document.createElement('div');
          errorLine.className = 'nc-terminal-line';
          errorLine.innerHTML = `Error fetching IP configuration: ${error.message}`;
          terminalOutput.appendChild(errorLine);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        });
      return 'Fetching IP configuration...';
    },
    whoami: () => {
      return 'user';
    },
    calc: (args) => {
      if (args.length === 0) return 'Usage: calc [expression]';
      try {
        const expression = args.join(' ');
        // Only allow numbers and operators for safety
        if (!/^[\d\s\+\-\*\/\(\)\.]+$/.test(expression)) {
          return 'Invalid characters in expression';
        }
        const result = Function('"use strict"; return (' + expression + ')')();
        return result.toString();
      } catch (error) {
        return 'Error: Invalid expression';
      }
    },
    history: () => {
      if (commandHistory.length === 0) {
        return 'No commands in history';
      }
      return commandHistory.map((cmd, index) => `${index + 1}. ${cmd}`).join('<br>');
    },
    joke: () => {
      fetch('https://official-joke-api.appspot.com/random_joke')
        .then(response => response.json())
        .then(data => {
          const jokeLine = document.createElement('div');
          jokeLine.className = 'nc-terminal-line';
          jokeLine.innerHTML = `${data.setup}<br>${data.punchline}`;
          terminalOutput.appendChild(jokeLine);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        })
        .catch(error => {
          const errorLine = document.createElement('div');
          errorLine.className = 'nc-terminal-line';
          errorLine.innerHTML = `Error fetching joke: ${error.message}`;
          terminalOutput.appendChild(errorLine);
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        });
      return 'Fetching a joke...';
    }
  };

  // Handle input
  terminalInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      const input = terminalInput.value.trim();
      if (input) {
        // Add to command history (limit to 50 commands)
        commandHistory.push(input);
        if (commandHistory.length > 50) {
          commandHistory.shift();
        }

        processCommand(input);
        terminalInput.value = '';
      }
    }
  });

  function processCommand(input) {
    // Add the input to the terminal
    const inputLine = document.createElement('div');
    inputLine.className = 'nc-terminal-line';
    inputLine.innerHTML = `<span class="nc-terminal-prompt">$</span> ${escapeHtml(input)}`;
    terminalOutput.appendChild(inputLine);

    // Split command and arguments
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Execute command
    if (commands[command]) {
      const output = commands[command](args);
      if (output) {
        const outputLine = document.createElement('div');
        outputLine.className = 'nc-terminal-line';
        outputLine.innerHTML = output;
        terminalOutput.appendChild(outputLine);
      }
    } else {
      const errorLine = document.createElement('div');
      errorLine.className = 'nc-terminal-line';
      errorLine.innerHTML = `Command not found: ${escapeHtml(command)}. Type 'help' for available commands.`;
      terminalOutput.appendChild(errorLine);
    }

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Focus on input when clicking on the terminal
  terminalOutput.addEventListener('click', function () {
    terminalInput.focus();
  });
}