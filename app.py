from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    try:
        name = request.json.get('name')
        email = request.json.get('email')
        phone = request.json.get('phone')
        message = request.json.get('message')
        
        # In a real application, you would process the form data here
        # For now, we'll just return a success response
        return jsonify({'success': True, 'message': 'Thank you for your message. Scott will get back to you soon.'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'There was an error sending your message. Please try again or call directly.'})

if __name__ == '__main__':
    app.run(debug=True)
