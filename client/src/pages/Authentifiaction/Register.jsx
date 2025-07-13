import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

const registerSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required(),
  password: yup.string().min(6, 'Password must be at least 6 characters').required(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerSchema.validate(formData, { abortEarly: false });

      console.log('📥 Mock registration:', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Registration successful! Redirecting...', { autoClose: 2000 });
      setTimeout(() => navigate('/login'), 2500);

    } catch (err) {
      if (err.name === 'ValidationError') {
        err.inner.forEach(e => toast.error(e.message));
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Create Account</h2>

        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Username"
            className="w-full border pl-10 pr-3 py-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

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

        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border pl-10 pr-3 py-2 rounded focus:ring-2 focus:ring-blue-300 outline-none transition"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition flex justify-center items-center"
          disabled={loading}
        >
          {loading && <ImSpinner2 className="animate-spin mr-2 text-lg" />}
          {loading ? 'Registering...' : 'Sign Up'}
        </button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
