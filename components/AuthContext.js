import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_BASE_URL} from '../config';
import {useNavigation} from '@react-navigation/native';

// Create AuthContext
const AuthContext = createContext();

// Create AuthProvider component to wrap the app and provide AuthContext
export const AuthProvider = ({children}) => {
  const navigation = useNavigation();
  const [jwt, setJwt] = useState(null);
  const [data, setData] = useState(null);
  const [permissions, setPermissions] = useState(null);

  const columnWidths = {
    no: 8,
    productCode: 24,
    hsn: 14,
    unit: 10,
    description: 10,
    qty: 10,
    rate: 16,
    mrp: 16,
    grossAmt: 16,
    gstp: 10,
    gstAmt: 18,
    subTotal: 18,
  };

  // Define isAuthenticated function
  const isAuthenticated = () => {
    return !!jwt;
  };

  useEffect(() => {
    // Load token from AsyncStorage when the component mounts
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwt');
        if (storedToken) {
          const {token, expirationTimestamp} = JSON.parse(storedToken);
          if (expirationTimestamp && expirationTimestamp > Date.now()) {
            // Token is not expired, set it and optimistically navigate
            setJwt({token, expirationTimestamp});
          } else {
            // Token is expired, remove it
            await AsyncStorage.removeItem('jwt');
            setJwt(null);
          }
        }
      } catch (error) {
        console.error('Error loading token:', error);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    // Fetch user profile data only if it's not already available
    if (!data && jwt) {
      axios
        .get(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${jwt.token}`,
          },
        })
        .then(res => {
          if (res.data.success) {
            const user = res.data.data.user;
            console.log('User profile loaded:', user);
            updateData(user); // Set user data in AuthProvider
            // Set permissions based on user role
            const userPermissions = {
              canCreateProducts: user.role === 'admin',
              canVerifyInvoices: user.role === 'admin',
              canViewAllInvoices: user.role === 'admin',
              canCreateInvoices: true,
              canScanProducts: true,
            };
            updatePermissions(userPermissions);

            // Auto-navigate based on role when token is present (auto-login)
            try {
              if (user.role === 'admin') {
                navigation.navigate('AdminDashboardScreen');
              } else {
                navigation.navigate('BillingScreen');
              }
            } catch (_) {}
          } else {
            console.log('Error fetching profile:', res.data.message);
            logout();
            navigation.navigate('Login');
          }
        })
        .catch(err => {
          console.log('Profile fetch error:', err);
          if (err.response?.status === 401) {
            logout();
            navigation.navigate('Login');
          }
        });
    }
  }, [jwt, isAuthenticated, navigation]);

  const login = async token => {
    try {
      const expirationTimeInMinutes = 60;
      // Save token and expiration time to AsyncStorage
      const expirationTimestamp = Date.now() + expirationTimeInMinutes * 60000; // Convert minutes to milliseconds
      await AsyncStorage.setItem(
        'jwt',
        JSON.stringify({token, expirationTimestamp}),
      );
      setJwt({token, expirationTimestamp});
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const logout = async () => {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('jwt');
      setJwt(null);
      setData(null);
      setPermissions(null);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  const updateData = newData => {
    setData(newData);
  };

  const updatePermissions = newPermissions => {
    setPermissions(newPermissions);
  };

  return (
    <AuthContext.Provider
      value={{
        jwt,
        login,
        logout,
        isAuthenticated,
        data,
        updateData,
        permissions,
        updatePermissions,
        columnWidths,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create useAuth hook to access AuthContext
export const useAuth = () => useContext(AuthContext);
