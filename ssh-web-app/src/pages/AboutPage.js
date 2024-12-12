import React from 'react';

const AboutPage = () => {
  return (
    <div>
      <div className="title-container">
        <h1 className="page-title">Welcome to the Future of Student Living with SSH Homes</h1>
      </div>
    <div className="container-fluid" style={{ marginBottom: "5%", paddingLeft: "35px", paddingRight: "35px", paddingTop: "35px"}}>
      <header className="about-header">
        <p>
          At Student Smart Home (SSH), we're revolutionizing the way you interact with your living spaces. 
          Our innovative SSH Camera, strategically mounted inside the refrigerator of your shared housing, 
          is not just an ordinary camera—it's your gateway to smarter, more sustainable living.
        </p>
      </header>
      <section className="why-choose-ssh">
        <h2>Why Choose SSH?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Smart Inventory Tracking</h3>
            <p>
              Gone are the days of guessing what's in your fridge. Our SSH Camera uses cutting-edge image recognition 
              technology to monitor and log your fridge contents in real-time. Know exactly what you have, how much, 
              and when you need to restock, all at a glance through the SSH Cloud.
            </p>
          </div>
          <div className="feature-card">
            <h3>Reduce Food Waste</h3>
            <p>
              With our new enhancements, the SSH Camera now tracks expiration dates and sends you timely notifications 
              for items nearing their shelf life. This means no more forgotten ingredients and significantly less food wastage.
            </p>
          </div>
          <div className="feature-card">
            <h3>Tailored Recipe Suggestions</h3>
            <p>
              Say goodbye to the hassle of sifting through recipes that don't fit your diet. Introducing our enhanced 
              recipe suggestion system, designed to cater to your individual dietary needs. Whether you're vegan, gluten-free, 
              or have specific food allergies, our system will recommend delicious recipes that respect your dietary preferences.
            </p>
          </div>
          <div className="feature-card">
            <h3>Join the SSH Community</h3>
            <p>
            Ready to simplify your student living experience? Create your profile today and let SSH help you manage your 
            dietary needs efficiently. With SSH, you're not just managing food—you're enhancing your lifestyle. Start making 
           smarter choices with us and embrace the full potential of your student smart home.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
  );
};

export default AboutPage;
