import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required(),
});

const Login = () => {
  const { backendUrl, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      await loginSchema.validate(formData, { abortEarly: false });
  
      // Call real API
      const response = await axios.post(
        `${backendUrl}/users/login`,
        formData
      );
  
      // PROPERLY EXTRACT DATA FROM RESPONSE
      const { user, token } = response.data.data; // Changed from response.data.data to response.data
      
      // Debugging logs (temporary)
      console.log('API Response:', response.data);
      console.log('Extracted user:', user);
      console.log('Extracted token:', token);
  
      // Update context (this will handle storage automatically)
      login({ token, user });
      
      toast.success('Login successful!', { autoClose: 2000 });
      setTimeout(
        () => navigate(user.role === 'admin' ? '/admin' : '/player'),
        2000
      );
    } catch (err) {
      console.error('Login error:', err);
      if (err.name === 'ValidationError') {
        err.inner.forEach((e) => toast.error(e.message));
      } else if (err.response && err.response.data) {
        toast.error(err.response.data.message || 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <ToastContainer />
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Welcome Back</h2>

        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            className="w-full border pl-10 pr-3 py-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="password"
            placeholder="Password"
            className="w-full border pl-10 pr-3 py-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition flex justify-center items-center"
          disabled={loading}
        >
          {loading && <ImSpinner2 className="animate-spin mr-2 text-lg" />}
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p className="text-center text-sm">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;