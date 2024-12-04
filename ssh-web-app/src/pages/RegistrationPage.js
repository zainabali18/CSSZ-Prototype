import React, { useState } from 'react';

const RegistrationPage = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [emailAvailable, setEmailAvailable] = useState(null); // Tracks email availability
    const [isSubmitting, setIsSubmitting] = useState(false); // Tracks form submission state
    const [errorMessage, setErrorMessage] = useState(''); // Tracks errors for feedback

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));

        if (name === 'email') {
            checkEmailAvailability(value);
        }
    };

    // Check if email is available
    const checkEmailAvailability = (email) => {
        fetch(`http://localhost:5001/check-email?email=${email}`)
            .then((response) => response.json())
            .then((data) => {
                setEmailAvailable(!data.exists); // Email is available if `exists` is false
                if (data.exists) {
                    setErrorMessage('Email is already registered.');
                } else {
                    setErrorMessage('');
                }
            })
            .catch((error) => {
                console.error('Error checking email:', error);
                setErrorMessage('Error checking email. Please try again.');
            });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (emailAvailable === false) {
            alert('Email is already registered. Please use a different email.');
            return;
        }

        setIsSubmitting(true);
        fetch('http://localhost:5001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        })
            .then((response) => response.json())
            .then((data) => {
                alert('Registration successful!');
                console.log('Success:', data);

                // Clear the form after successful registration
                setUserData({ username: '', email: '', password: '' });
                setEmailAvailable(null);
            })
            .catch((error) => {
                console.error('Error registering user:', error);
                alert('Error registering user. Please try again.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className="container-fluid mainContainer">
            <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
                <h1 className="title_features">Register</h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Enter your username"
                            value={userData.username}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                        />
                        {emailAvailable === false && (
                            <p style={{ color: 'red', fontSize: '0.9em' }}>{errorMessage}</p>
                        )}
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginBottom: '5px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || emailAvailable === false}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;
