document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const spinner = submitBtn?.querySelector('.spinner');
    const formMessages = document.getElementById('form-messages');
    let isSubmitting = false;

    // Add honeypot field for spam prevention
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.display = 'none';
    honeypot.setAttribute('aria-hidden', 'true');
    contactForm?.appendChild(honeypot);

    // Add input event listeners for real-time validation
    const formInputs = contactForm?.querySelectorAll('input, textarea');
    formInputs?.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('error');
                const errorElement = this.nextElementSibling;
                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.textContent = '';
                }
            }
        });
    });

    // Form submission handler
    contactForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (isSubmitting) return;
        isSubmitting = true;
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        spinner.style.display = 'inline-block';
        
        // Clear previous messages
        formMessages.innerHTML = '';
        formMessages.className = 'form-messages';
        
        // Clear previous error states
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        
        try {
            // Basic client-side validation
            let isValid = true;
            const formData = new FormData(contactForm);
            
            // Validate name (required, min 2 chars)
            const name = formData.get('name')?.trim() || '';
            if (name.length < 2) {
                showError('name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Validate email (required, valid format)
            const email = formData.get('email')?.trim() || '';
            if (!email) {
                showError('email', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate phone (optional, but if provided, must be valid)
            const phone = formData.get('phone')?.trim() || '';
            if (phone && !isValidPhone(phone)) {
                showError('phone', 'Please enter a valid phone number');
                isValid = false;
            }
            
            // Validate subject (required)
            const subject = formData.get('subject')?.trim() || '';
            if (!subject) {
                showError('subject', 'Subject is required');
                isValid = false;
            }
            
            // Validate message (required, min 10 chars)
            const message = formData.get('message')?.trim() || '';
            if (message.length < 10) {
                showError('message', 'Message must be at least 10 characters');
                isValid = false;
            }
            
            if (!isValid) {
                throw new Error('Please correct the form errors');
            }
            
            // Add timestamp to prevent duplicate submissions
            formData.append('form_submitted', new Date().toISOString());
            
            // Send form data to server
            const response = await fetch('submit-form.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Network response was not ok');
            }
            
            // Handle success
            if (data.success) {
                showSuccessMessage(data.message || 'Thank you! Your message has been sent successfully.');
                contactForm.reset();
                
                // Scroll to success message
                formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formMessages.style.opacity = '0';
                    setTimeout(() => {
                        formMessages.style.display = 'none';
                    }, 500);
                }, 5000);
            } else {
                // Handle server-side validation errors
                if (data.errors) {
                    Object.entries(data.errors).forEach(([field, message]) => {
                        showError(field, message);
                    });
                    throw new Error('Please correct the form errors');
                } else {
                    throw new Error(data.message || 'An error occurred');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Show error message
            formMessages.className = 'form-messages error';
            formMessages.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
            // Handle the response from the server
            if (response.ok) {
                if (data.success) {
                    // Show success message
                    showSuccessMessage(data.message || 'Your message has been sent successfully!');
                    // Reset the form
                    contactForm.reset();
                } else {
                    // Show validation errors from server
                    if (data.errors) {
                        Object.entries(data.errors).forEach(([field, message]) => {
                            showError(field, message);
                        });
                    } else {
                        showFormMessage('error', data.message || 'An error occurred. Please try again.');
                    }
                }
            } else {
                // Handle HTTP errors
                if (data && data.message) {
                    showFormMessage('error', data.message);
                } else {
                    showFormMessage('error', 'An error occurred while sending your message. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showFormMessage('error', 'An unexpected error occurred. Please try again later.');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.textContent = 'Send Message';
            spinner.style.display = 'none';
            isSubmitting = false;
            
            // Scroll to messages if there are any
            if (formMessages.textContent.trim() !== '') {
                formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    // Helper functions
    function showError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            let errorElement = field.nextElementSibling;
            
            // Create error message element if it doesn't exist
            if (!errorElement || !errorElement.classList.contains('error-message')) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
            
            errorElement.textContent = message;
        }
    }
    
    function showFormMessage(type, message) {
        formMessages.className = `form-messages ${type}`;
        formMessages.style.display = 'block';
        formMessages.style.opacity = '1';
        formMessages.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
    }
    
    function showSuccessMessage(message) {
        showFormMessage('success', message);
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    function isValidPhone(phone) {
        // Simple phone validation - allows numbers, spaces, +, -, (, )
        const re = /^[0-9\s+\-()]+$/;
        return re.test(phone);
    }
});
