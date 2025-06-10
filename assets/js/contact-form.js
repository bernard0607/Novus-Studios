document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const formMessages = document.getElementById('form-messages');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            spinner.style.display = 'inline-block';
            
            // Clear previous messages
            formMessages.innerHTML = '';
            formMessages.className = 'form-messages';
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Send form data to server
            fetch('process_form.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Handle success
                if (data.success) {
                    formMessages.className = 'form-messages success';
                    formMessages.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
                    contactForm.reset();
                } else {
                    formMessages.className = 'form-messages error';
                    formMessages.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.message}`;
                }
            })
            .catch(error => {
                formMessages.className = 'form-messages error';
                formMessages.innerHTML = '<i class="fas fa-exclamation-circle"></i> An error occurred. Please try again later.';
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button state
                submitBtn.disabled = false;
                btnText.textContent = 'Send Message';
                spinner.style.display = 'none';
                
                // Scroll to messages
                formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }
});
