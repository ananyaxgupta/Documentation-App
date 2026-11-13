import React from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Editor from './component/Editor';
import Login from './component/Login';
import Signup from './component/Signup';
import Dashboard from './component/Dashboard';

const ProtectedRoute = ({ component: Component }) => {
  return localStorage.getItem('token') ? <Component /> : <Navigate to="/login" />;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Signup />} />

          {/* Protected Routes */}
          <Route path='/' element={<Navigate replace to="/dashboard" />} />
          <Route
            path='/dashboard'
            element={<ProtectedRoute component={Dashboard} />}
          />
          <Route
            path='/docs/:id'
            element={<ProtectedRoute component={Editor} />}
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
