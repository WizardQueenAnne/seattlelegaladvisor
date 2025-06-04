from flask import Flask, render_template, request, jsonify
import os
import requests
from datetime import datetime
import logging

app = Flask(__name__)

# Configure Flask
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Formspree configuration
FORMSPREE_ENDPOINT = os.environ.get('FORMSPREE_ENDPOINT', 'https://formspree.io/f/YOUR_FORM_ID')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data received'}), 400
            
        # Extract form data with better validation
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        company = data.get('company', '').strip()
        city = data.get('city', '').strip()
        state = data.get('state', '').strip()
        how_found = data.get('how_found', '').strip()
        contact_method = data.get('contact_method', '').strip()
        message = data.get('message', '').strip()
        disclaimer = data.get('disclaimer')
        
        # Enhanced validation
        if not name or len(name) < 2:
            return jsonify({'success': False, 'message': 'Please provide a valid name.'}), 400
        
        if not email or '@' not in email:
            return jsonify({'success': False, 'message': 'Please provide a valid email address.'}), 400
        
        if not phone or len(phone) < 10:
            return jsonify({'success': False, 'message': 'Please provide a valid phone number.'}), 400
        
        if not message or len(message) < 10:
            return jsonify({'success': False, 'message': 'Please provide more details about your legal needs.'}), 400
        
        if not disclaimer:
            return jsonify({'success': False, 'message': 'Please agree to the disclaimer.'}), 400
        
        # Log the submission for debugging
        logger.info(f"New contact form submission from {name} ({email})")
        
        # Send to Formspree
        formspree_success = False
        try:
            formspree_success = send_via_formspree(name, email, phone, company, city, state, how_found, contact_method, message)
            if formspree_success:
                logger.info("Successfully sent to Formspree")
            else:
                logger.warning("Formspree submission failed, but continuing...")
        except Exception as formspree_error:
            logger.error(f"Formspree submission failed: {str(formspree_error)}")
        
        # Always log the submission as backup
        log_submission(name, email, phone, company, city, state, how_found, contact_method, message)
        
        return jsonify({
            'success': True, 
            'message': 'Thank you for your message! Scott will get back to you within 24 hours. You can also call directly at 206-240-0442 for immediate assistance.'
        })
        
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        return jsonify({
            'success': False, 
            'message': 'There was an error sending your message. Please try again or call directly at 206-240-0442.'
        }), 500

def send_via_formspree(name, email, phone, company, city, state, how_found, contact_method, message):
    """Send form data to Formspree with enhanced formatting"""
    
    # Create a professional email body
    location_str = f"{city}, {state}" if city and state else city or state or 'Not provided'
    
    email_body = f"""
NEW CONSULTATION REQUEST - {datetime.now().strftime('%B %d, %Y at %I:%M %p PST')}

CLIENT INFORMATION:
• Name: {name}
• Email: {email}
• Phone: {phone}
• Company: {company or 'Not provided'}
• Location: {location_str}

CONTACT PREFERENCES:
• How they found us: {how_found or 'Not specified'}
• Preferred contact method: {contact_method or 'Not specified'}

LEGAL INQUIRY:
{message}

---
This consultation request was submitted through seattlelegaladvisor.com
Please respond within 24 hours for optimal client service.
    """.strip()
    
    # Prepare data for Formspree
    form_data = {
        'name': name,
        'email': email,
        'phone': phone,
        'message': email_body,
        '_replyto': email,
        '_subject': f'Consultation Request from {name} - Seattle Legal Advisor',
        '_next': 'https://seattlelegaladvisor.onrender.com/',
        'company': company,
        'city': city,
        'state': state,
        'how_found': how_found,
        'contact_method': contact_method,
        'client_message': message,  # Keep original message separate
        'submission_time': datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            FORMSPREE_ENDPOINT,
            data=form_data,
            headers={'Accept': 'application/json'},
            timeout=15  # Increased timeout
        )
        
        if response.status_code == 200:
            return True
        else:
            logger.error(f"Formspree error: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"Request to Formspree failed: {str(e)}")
        return False

def log_submission(name, email, phone, company, city, state, how_found, contact_method, message):
    """Log submission as backup with enhanced formatting"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S PST')
    location = f"{city}, {state}" if city and state else city or state or 'Not provided'
    
    log_entry = f"""
{'='*80}
CONTACT FORM SUBMISSION - {timestamp}
{'='*80}
Name: {name}
Email: {email}
Phone: {phone}
Company: {company or 'Not provided'}
Location: {location}
How Found: {how_found or 'Not specified'}
Contact Method: {contact_method or 'Not specified'}

Message:
{message}
{'='*80}
    """
    
    logger.info(log_entry)
    
    # Also try to write to a file if possible
    try:
        log_file = 'contact_submissions.log'
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + '\n')
    except Exception as e:
        logger.warning(f"Could not write to log file: {str(e)}")

@app.errorhandler(404)
def not_found_error(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return render_template('index.html'), 500

# Health check endpoint for deployment
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Seattle Legal Advisor'
    }), 200

# Additional endpoint for testing
@app.route('/test')
def test():
    return jsonify({
        'message': 'Seattle Legal Advisor API is working',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    # This will only run when executing the script directly
    # In production, gunicorn will handle the WSGI application
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
