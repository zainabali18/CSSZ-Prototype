import React from 'react';

const PrivacyPolicyPage = () => {
    return (
    <div>
      <div className="title-container">
        <h1 className="page-title">Privacy Policy</h1>
      </div>

      <div className="privacy-container">
        <p className="privacy-intro">
          Your privacy is important to us. This page explains how we collect, use, disclose, and safeguard your 
          information when you visit our web-app.
        </p>

        <div className="privacy-columns">
          <div className="privacy-column">
            <h2>Information We Collect</h2>
            <ul>
              <li><strong>Personal Data:</strong> Your name, email address, and demographic information that you voluntarily give to us.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, and operating system.</li>
            </ul>
          </div>

          <div className="privacy-column">
            <h2>Use of Your Information</h2>
            <ul>
              <li>Deliver targeted advertising and other information regarding promotions and the site.</li>
              <li>Respond to your inquiries and offer customer service.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the site.</li>
            </ul>
          </div>

          <div className="privacy-column">
            <h2>Disclosure of Your Information</h2>
            <ul>
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process or to protect the rights of others.</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us.</li>
            </ul>
          </div>

          <div className="privacy-column">
            <h2>Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> support@shhhomes.com <br />
              <strong>Phone:</strong> +123 345123 556
            </p>
          </div>
        </div>
      </div>
    </div>
    );
};

export default PrivacyPolicyPage;
