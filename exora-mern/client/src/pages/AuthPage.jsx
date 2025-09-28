import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Particles from '../components/Particles';
import CardNav from '../components/CardNav';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    usageType: 'business'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated (but not after fresh registration)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only redirect if we're not in the middle of a fresh registration
      // The handleSubmit function will handle the redirect for new registrations
      const isFreshRegistration = localStorage.getItem('freshRegistration') === 'true';
      if (!isFreshRegistration) {
        const redirectPath = user.usageType === 'personal' ? '/personal-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        // Clear the fresh registration flag
        localStorage.removeItem('freshRegistration');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          formData.usageType
        );
      }

      if (result.success) {
        // Set flag to prevent useEffect from redirecting
        localStorage.setItem('freshRegistration', 'true');
        // Redirect based on usage type
        const redirectPath = result.data.user.usageType === 'personal' ? '/personal-dashboard' : '/dashboard';
        navigate(redirectPath);
      } else {
        if (result.errors) {
          setErrors(result.errors.reduce((acc, error) => {
            acc[error.param] = error.msg;
            return acc;
          }, {}));
        } else {
          setErrors({ general: result.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      usageType: 'business'
    });
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="auth-page">
      <Particles
        particleColors={['#c084fc', '#a855f7', '#7c3aed']}
        particleCount={200}
        particleSpread={8}
        speed={0.04}
        particleBaseSize={60}
        moveParticlesOnHover={false}
        alphaParticles={false}
        disableRotation={false}
      />
      
      {/* Navigation */}
      <CardNav
        items={[
          { label: 'About', bgColor: '#0D0716', textColor: '#fff', links: [ { label: 'Company', ariaLabel: 'About Company', href: '#company' }, { label: 'Careers', ariaLabel: 'About Careers', href: '#company' } ] },
          { label: 'Products', bgColor: '#170D27', textColor: '#fff', links: [ { label: 'Featured', ariaLabel: 'Featured Projects', href: '#products' }, { label: 'Case Studies', ariaLabel: 'Project Case Studies', href: '#solutions' } ] },
          { label: 'Join us', bgColor: '#271E37', textColor: '#fff', links: [ { label: 'Email', ariaLabel: 'Email us', href: '#join' }, { label: 'Twitter', ariaLabel: 'Twitter', href: '#join' }, { label: 'LinkedIn', ariaLabel: 'LinkedIn', href: '#join' } ] }
        ]}
        baseColor="rgba(255,255,255,0.08)"
        menuColor="#fff"
        buttonBgColor="rgba(17,17,17,0.75)"
        buttonTextColor="#fff"
        ease="power3.out"
      />
      
      <div className="auth-page-content">
        <div className="auth-page-header">
          <button className="auth-back-btn" onClick={goBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </button>
        </div>

        <div className="auth-page-container">
          <div className="auth-page-card">
            <div className="auth-page-header-content">
              <h1 className="auth-page-title">
                {isLogin ? 'Welcome Back' : 'Join Exora'}
              </h1>
              <p className="auth-page-subtitle">
                {isLogin 
                  ? 'Sign in to your account to continue' 
                  : 'Create your account to get started'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-page-form">
              {errors.general && (
                <div className="auth-page-error-general">
                  {errors.general}
                </div>
              )}

              {!isLogin && (
                <div className="auth-page-row">
                  <div className="auth-page-field">
                    <label htmlFor="firstName" className="auth-page-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`auth-page-input ${errors.firstName ? 'error' : ''}`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <span className="auth-page-error">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="auth-page-field">
                    <label htmlFor="lastName" className="auth-page-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`auth-page-input ${errors.lastName ? 'error' : ''}`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <span className="auth-page-error">{errors.lastName}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="auth-page-field">
                <label htmlFor="email" className="auth-page-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`auth-page-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="auth-page-error">{errors.email}</span>
                )}
              </div>

              <div className="auth-page-field">
                <label htmlFor="password" className="auth-page-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`auth-page-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <span className="auth-page-error">{errors.password}</span>
                )}
              </div>

              {!isLogin && (
                <div className="auth-page-field">
                  <label htmlFor="usageType" className="auth-page-label">
                    How will you use Exora?
                  </label>
                  <select
                    id="usageType"
                    name="usageType"
                    value={formData.usageType}
                    onChange={handleInputChange}
                    className={`auth-page-input ${errors.usageType ? 'error' : ''}`}
                  >
                    <option value="business">Business Use</option>
                    <option value="personal">Personal Use</option>
                  </select>
                  {errors.usageType && (
                    <span className="auth-page-error">{errors.usageType}</span>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="auth-page-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="auth-page-spinner" />
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="auth-page-switch">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  className="auth-page-switch-btn"
                  onClick={switchMode}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
