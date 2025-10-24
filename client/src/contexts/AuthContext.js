import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';
import socketService from '../services/socket';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: parsedUser, token },
        });

        // Connect to socket
        socketService.connect();
        socketService.joinUserRoom(parsedUser.id);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        logout();
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await authService.login(email, password);
      
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.user, token: response.token },
        });

        // Connect to socket
        socketService.connect();
        socketService.joinUserRoom(response.user.id);

        return { success: true };
      } else {
        dispatch({ type: 'ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'ERROR', payload: message });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOADING' });
      const response = await authService.register(userData);
      
      if (response.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.user, token: response.token },
        });

        // Connect to socket
        socketService.connect();
        socketService.joinUserRoom(response.user.id);

        return { success: true };
      } else {
        dispatch({ type: 'ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'ERROR', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    authService.logout();
    socketService.disconnect();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};