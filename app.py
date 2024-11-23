from flask import Flask, render_template, request, jsonify
import subprocess
import sys
import os
import tempfile

app = Flask(__name__)

# Endpoint to render the HTML page
@app.route('/')
def index():
    return render_template('/index.html')

# Endpoint to execute the code submitted by the user
@app.route('/run_code', methods=['POST'])
def run_code():
    code = request.json.get('code')  # Retrieve the code from the frontend

    # Create a temporary file to store the code
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.py')
    temp_file.write(code.encode())
    temp_file.close()

    try:
        # Run the Python code using subprocess
        result = subprocess.run([sys.executable, temp_file.name], capture_output=True, text=True)

        # Get the output or error message
        output = result.stdout if result.returncode == 0 else result.stderr

        # Clean up the temporary file
        os.remove(temp_file.name)

        return jsonify({'output': output, 'status': 'success'})
    except Exception as e:
        # Handle any errors during code execution
        return jsonify({'output': str(e), 'status': 'error'})


if __name__ == '__main__':
    app.run(debug=True)

