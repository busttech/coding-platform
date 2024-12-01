const form = document.getElementById('codeForm');
const resultDiv = document.getElementById('result');
const codeArea = document.getElementById('code');
const warningMessage = document.getElementById('warningMessage');
let warningCount = 0;
let warningCoun = 0;
function handleScreenResize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Set thresholds for disabling the code editor (e.g., width < 768px or height < 500px)
    if (screenWidth < 1200 || screenHeight < 500) {
        // Disable code editor and show warning
        codeArea.disabled = true;
        codeArea.value = ""; // Optional: Clear the editor
        warningMessage.textContent = "Code editor is disabled because the screen is too small or split.";
        warningMessage.style.display = 'block';
    } else {
        // Enable code editor and hide warning
        codeArea.disabled = false;
        warningMessage.style.display = 'none';
    }
}

// Add event listener for window resize
window.addEventListener('resize', handleScreenResize);

// Call the function initially to check the screen size on page load
handleScreenResize();
form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const code = codeArea.value;

    // Display warning if needed
    if (code.trim() === "") {
        warningCoun++;
        warningMessage.textContent = `Warning ${warningCoun}: You haven't written any code.`;
        warningMessage.style.display = 'block';
        
        // Refresh the page after 3 warnings
        if (warningCoun >= 3) {
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
    // Auto-pair characters
    const pairs = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'"
    };

    if (pairs[event.key]) {
        const openChar = event.key;
        const closeChar = pairs[openChar];

        // Insert the pair and position the cursor in the middle
        codeArea.value = 
            codeText.substring(0, cursorPosition) + 
            openChar + closeChar + 
            codeText.substring(cursorPosition);
        
        // Move cursor to the middle of the pair
        codeArea.setSelectionRange(cursorPosition + 1, cursorPosition + 1);

        event.preventDefault(); // Prevent the default typing behavior
    }

    if (event.key === 'Enter') {
        // Get the text before the cursor and split by lines
        const lines = codeText.substring(0, cursorPosition).split('\n');
        const lastLine = lines[lines.length - 1];

        // Determine current indentation
        const currentIndentation = lastLine.match(/^\s*/)[0];
        const additionalIndentation = lastLine.trim().endsWith(':') ? '    ' : ''; // Add 4 spaces if line ends with a colon

        // Insert newline with proper indentation
        codeArea.value = 
            codeText.substring(0, cursorPosition) + '\n' + 
            currentIndentation + additionalIndentation + 
            codeText.substring(cursorPosition);
        
        // Adjust cursor position
        codeArea.setSelectionRange(
            cursorPosition + currentIndentation.length + additionalIndentation.length + 1, 
            cursorPosition + currentIndentation.length + additionalIndentation.length + 1
        );

        event.preventDefault(); // Prevent default Enter behavior
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
        if (warningCount >= 3) {
            alert('You have received 3 warnings. The page will now refresh.');
            window.location.reload(); // Refresh the page
        }
    }
});


