from flask import Flask, render_template, request, jsonify
import os
import requests
from datetime import datetime

app = Flask(__name__)

# Configure Flask
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Formspree configuration
FORMSPREE_ENDPOINT = os.environ.get('FORMSPREE_ENDPOINT', 'https://formspree.io/f/YOUR_FORM_ID')

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
        
        # Send to Formspree
        try:
            success = send_via_formspree(name, email, phone, company, city, state, how_found, contact_method, message)
            if not success:
                raise Exception("Formspree submission failed")
        except Exception as formspree_error:
            print(f"Formspree submission failed: {str(formspree_error)}")
            # Log the submission as backup
            log_submission(name, email, phone, company, city, state, how_found, contact_method, message)
            # Still return success to user - the form data is captured
        
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

def send_via_formspree(name, email, phone, company, city, state, how_found, contact_method, message):
    """Send form data to Formspree"""
    
    # Prepare data for Formspree
    form_data = {
        'name': name,
        'email': email,
        'phone': phone,
        'message': f"""
New Contact Form Submission

Name: {name}
Email: {email}
Phone: {phone}
Company: {company if company else 'Not provided'}
Location: {f"{city}, {state}" if city or state else 'Not provided'}
How they found us: {how_found if how_found else 'Not provided'}
Preferred contact method: {contact_method if contact_method else 'Not provided'}

Message:
{message}

Submitted: {datetime.now().strftime('%B %d, %Y at %I:%M %p PST')}
        """.strip(),
        '_replyto': email,
        '_subject': f'New Contact Form Submission from {name}',
        '_next': 'https://seattlelegaladvisor.com/thank-you',  # Optional thank you page
        'company': company,
        'city': city,
        'state': state,
        'how_found': how_found,
        'contact_method': contact_method
    }
    
    try:
        response = requests.post(
            FORMSPREE_ENDPOINT,
            data=form_data,
            headers={'Accept': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            print("Successfully sent to Formspree")
            return True
        else:
            print(f"Formspree error: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"Request to Formspree failed: {str(e)}")
        return False

def log_submission(name, email, phone, company, city, state, how_found, contact_method, message):
    """Log submission as backup"""
    print(f"\n=== CONTACT FORM SUBMISSION - {datetime.now()} ===")
    print(f"Name: {name}")
    print(f"Company: {company}")
    print(f"Email: {email}")
    print(f"Phone: {phone}")
    print(f"City: {city}")
    print(f"State: {state}")
    print(f"How found: {how_found}")
    print(f"Contact method: {contact_method}")
    print(f"Message: {message}")
    print("=" * 50)

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
