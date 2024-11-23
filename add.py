from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Set up the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///questions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Question model
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    what_to_do = db.Column(db.String(500), nullable=False)
    examples = db.Column(db.PickleType, nullable=False)  # Store list of examples (input-output pairs)

    def __repr__(self):
        return f"<Question {self.id}>"

# Route to display the form and add questions
@app.route('/add_question', methods=['GET', 'POST'])
def add_question():
    if request.method == 'POST':
        # Get data from form
        title = request.form['title']
        what_to_do = request.form['what_to_do']

        # Prepare examples (a list of tuples with input-output)
        examples = []
        example_count = int(request.form['example_count'])

        for i in range(example_count):
            input_data = request.form[f'input_{i}']
            output_data = request.form[f'output_{i}']
            examples.append({'input': input_data, 'output': output_data})

        # Create a new question instance
        new_question = Question(title=title, what_to_do=what_to_do, examples=examples)

        # Add to the database
        db.session.add(new_question)
        db.session.commit()

        return redirect(url_for('add_question'))  # Redirect to the same page after form submission

    # Retrieve all questions from the database
    questions = Question.query.all()

    return render_template('add_question.html', questions=questions)

# Run the app
if __name__ == '__main__': # Create tables if they don't exist
    app.run(debug=True)
