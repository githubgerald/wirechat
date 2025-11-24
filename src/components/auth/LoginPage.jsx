import { useState, useMemo } from 'react';
import loginBg1 from '../../assets/images/login-background-1.jpg';
import loginBg2 from '../../assets/images/login-background-2.jpg';
import loginBg3 from '../../assets/images/login-background-3.jpg';
import loginBg4 from '../../assets/images/login-background-4.jpg';
import '../../styles/login-styles.css';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetInfo, setShowResetInfo] = useState(false);

  // Select random background on component mount
  const randomBg = useMemo(() => {
    const backgrounds = [loginBg1, loginBg2, loginBg3, loginBg4];
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowResetInfo(false);
    setIsLoading(true);

    try {
      console.log('[LoginPage] Attempting login with username:', username);
      const response = await fetch('http://localhost:5000/api/v0/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text();
        console.error('[LoginPage] Failed to parse JSON response:', parseErr, 'Raw response:', text);
        setError('Unexpected server response. See console for details.');
        setIsLoading(false);
        return;
      }
      console.log('[LoginPage] Response status:', response.status, 'Data:', data);

      if (response.ok && data && data.success) {
        // Save auth info to localStorage
        console.log('[LoginPage] Saving to localStorage - token:', data.token, 'username:', data.username);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userProfile', JSON.stringify(data.profile || {}));
        localStorage.setItem('userSettings', JSON.stringify(data.settings || {}));
        localStorage.setItem('userPermissions', JSON.stringify(data.permissions || []));
        // Call success callback to update parent component
        onLoginSuccess(data.username, data.token);
      } else {
        const errorMsg = (data && data.error) ? data.error : 'Login failed';
        console.error('[LoginPage] Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Connection error. Make sure the server is running on port 5000.';
      setError(errorMsg);
      console.error('[LoginPage] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    setShowResetInfo(!showResetInfo);
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${randomBg})` }}>
      <div className="login-box">
        <h1>wirechat</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button 
          type="button"
          className="reset-button"
          onClick={handleResetPassword}
          disabled={isLoading}
        >
          Reset Password
        </button>
        {showResetInfo && (
          <div className="reset-info">
            <p>Contact an administrator to reset your password.</p>
          </div>
        )}
      </div>
    </div>
  );
}
