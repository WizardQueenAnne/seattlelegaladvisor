from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

# Configure Flask
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data received'}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        company = data.get('company', '').strip()
        city = data.get('city', '').strip()
        state = data.get('state', '').strip()
        how_found = data.get('how_found', '').strip()
        contact_method = data.get('contact_method', '').strip()
        message = data.get('message', '').strip()
        
        # Basic validation
        if not name or not email or not message:
            return jsonify({'success': False, 'message': 'Name, email, and message are required.'}), 400
        
        # In a production environment, you would:
        # 1. Save to database
        # 2. Send email notification
        # 3. Integrate with CRM
        # For now, we'll just log the submission
        
        print(f"Contact form submission:")
        print(f"Name: {name}")
        print(f"Company: {company}")
        print(f"Email: {email}")
        print(f"Phone: {phone}")
        print(f"City: {city}")
        print(f"State: {state}")
        print(f"How found: {how_found}")
        print(f"Contact method: {contact_method}")
        print(f"Message: {message}")
        
        return jsonify({
            'success': True, 
            'message': 'Thank you for your message. Scott will get back to you soon.'
        })
        
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'There was an error sending your message. Please try again or call directly at 206-240-0442.'
        }), 500

@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('index.html'), 500

# Health check endpoint for deployment
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    # This will only run when executing the script directly
    # In production, gunicorn will handle the WSGI application
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
