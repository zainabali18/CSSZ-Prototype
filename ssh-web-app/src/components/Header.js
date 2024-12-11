import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ isLoggedIn, userEmail, onLogout }) => {
    const [alertsVisible, setAlertsVisible] = useState(false);
    const [alerts, setAlerts] = useState({ expired: [], expiring: [] });

    const fetchAlerts = () => {
        if (!userEmail) {
            console.error('User email is missing. Cannot fetch alerts.');
            return;
        }
    
        fetch(`http://localhost:5001/api/inventory/alerts?email=${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error fetching alerts: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                setAlerts(data);
            })
            .catch((error) => {
                console.error('Error fetching alerts:', error);
            });
    };
     
    
    const toggleAlerts = () => {
        if (!alertsVisible) {
            fetchAlerts(); // Fetch alerts only when opening
        }
        setAlertsVisible(!alertsVisible);
    };

    return (
        <header data-bs-theme="dark">
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top bg-dark">
                <div className="container">
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse"
                        aria-controls="navbarCollapse"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarCollapse">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/" exact activeclassname="active">
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/about" activeclassname="active">
                                    About SSH Recipe Recommendation App
                                </NavLink>
                            </li>
                            {isLoggedIn && (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/inventory" activeclassname="active">
                                            Inventory
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/recipes" activeclassname="active">
                                            Recipes
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                        <ul className="navbar-nav ml-auto">
                            {!isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/login" activeclassname="active">
                                            Login
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/register" activeclassname="active">
                                            Register
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <button className="nav-link btn" onClick={toggleAlerts}>
                                            Alerts
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/preferences" activeclassname="active">
                                            User Preferences
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            className="nav-link btn"
                                            to="/logout"
                                        >
                                            Log out
                                        </NavLink>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
            {alertsVisible && (
                <div className="alerts-panel">
                    <h2>Alerts</h2>
                    <div>
                        <h3>Expired Items:</h3>
                        <ul>
                            {alerts.expired && alerts.expired.length > 0 ? (
                                alerts.expired.map((alert, index) => <li key={index}>{alert}</li>)
                            ) : (
                                <li>No expired items.</li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h3>About-to-Expire Items:</h3>
                        <ul>
                            {alerts.expiring && alerts.expiring.length > 0 ? (
                                alerts.expiring.map((alert, index) => <li key={index}>{alert}</li>)
                            ) : (
                                <li>No items about to expire.</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

        </header>
    );
};

export default Header;
