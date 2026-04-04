import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      <p>
        Remember your password? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
