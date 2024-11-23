const form = document.getElementById('codeForm');
const resultDiv = document.getElementById('result');
const codeArea = document.getElementById('code');
const warningMessage = document.getElementById('warningMessage');
let warningCount = 0;

form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const code = codeArea.value;

    // Display warning if needed
    if (code.trim() === "") {
        warningCount++;
        warningMessage.textContent = `Warning ${warningCount}: You haven't written any code.`;
        warningMessage.style.display = 'block';
        
        // Refresh the page after 3 warnings
        if (warningCount >= 3) {
            alert('You have received 3 warnings. The page will now refresh.');
            window.location.reload(); // Refresh the page
        }

        return; // Do not proceed with code execution if the code is empty
    }

    // Hide warning message if there's any code
    warningMessage.style.display = 'none';
    resultDiv.textContent = 'Running...';
    resultDiv.classList.remove('error');
    // Make API request to Flask backend to run the code
    fetch('/run_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        // Display the output in the result div
        resultDiv.textContent = data.output;
        resultDiv.classList.remove('error');
        if (data.status === 'error') {
            resultDiv.classList.add('error');
        }
    })
    .catch(error => {
        resultDiv.textContent = 'An error occurred while executing the code.';
        resultDiv.classList.add('error');
    });
});

// Automatically indent after colon and enter key
codeArea.addEventListener('keydown', function(event) {
    const cursorPosition = codeArea.selectionStart;
    const codeText = codeArea.value;

    // Check if colon is entered and enter is pressed
    if (event.key === 'Enter') {
        // Check if the line ends with a colon
        const lineBeforeCursor = codeText.substring(0, cursorPosition);
        const lastLine = lineBeforeCursor.split('\n').pop();

        if (lastLine.trim().endsWith(':')) {
            // Add indentation (4 spaces)
            const indentation = '    '; // 4 spaces for indentation
            codeArea.value = codeText.substring(0, cursorPosition) + '\n' + indentation + codeText.substring(cursorPosition);
            codeArea.setSelectionRange(cursorPosition + indentation.length + 1, cursorPosition + indentation.length + 1);
            event.preventDefault(); // Prevent default Enter behavior
        }
    }

    // Automatically insert closing parenthesis when '(', '[', '{' is typed
    if (event.key === '(' || event.key === '[' || event.key === '{' || event.key === '"' || event.key === "'") {
        let closingChar = '';
        // Handle different types of opening brackets
        if (event.key === '(') {
            closingChar = ')';
        } else if (event.key === '[') {
            closingChar = ']';
        } else if (event.key === '{') {
            closingChar = '}';
        } else if (event.key === '"') {
            closingChar = '"';
        } else if (event.key === "'") {
            closingChar = "'";
        }

        // Insert the closing bracket after the opening bracket
        const cursorPosition = codeArea.selectionStart;
        const codeText = codeArea.value;

        codeArea.value = codeText.substring(0, cursorPosition) + event.key + closingChar + codeText.substring(cursorPosition);
        codeArea.setSelectionRange(cursorPosition + 1, cursorPosition + 1); // Place cursor between the brackets or quotes
        event.preventDefault(); // Prevent default insertion
    }
});

// Disable copy, cut, paste, and drag-and-drop in the textarea
codeArea.addEventListener('copy', function(event) {
    event.preventDefault();
    alert('Copying is disabled in this editor.');
});

codeArea.addEventListener('cut', function(event) {
    event.preventDefault();
    alert('Cutting is disabled in this editor.');
});

codeArea.addEventListener('paste', function(event) {
    event.preventDefault();
    alert('Pasting is disabled in this editor.');
});

// Block drag and drop functionality
codeArea.addEventListener('dragstart', function(event) {
    event.preventDefault();
});

codeArea.addEventListener('dragover', function(event) {
    event.preventDefault();
});

codeArea.addEventListener('drop', function(event) {
    event.preventDefault();
    alert('Drag and drop is disabled in this editor.');
});

// Listen to visibility changes (detect if user switches tabs)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // User switched to another tab
        warningCount++;
        warningMessage.textContent = `Warning ${warningCount}: You've switched tabs.`;
        warningMessage.style.display = 'block';

        // Refresh the page after 3 warnings
        if (warningCount >= 20) {
            alert('You have received 3 warnings. The page will now refresh.');
            window.location.reload(); // Refresh the page
        }
    }
});
