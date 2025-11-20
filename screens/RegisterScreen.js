import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import {API_BASE_URL} from '../config';
import {useAuth} from '../components/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RegisterScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {login} = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateForm = () => {
    const {username, email, password, confirmPassword, firstName, lastName} = formData;

    if (!username.trim() || !email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Match backend password policy: at least 6 chars, one uppercase, one lowercase, one number
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordPolicy.test(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters and include at least one uppercase letter, one lowercase letter, and one number'
      );
      return false;
    }

    // Match backend username policy: 3-50 chars, letters/numbers/underscores only
    const usernameTrimmed = username.trim();
    if (usernameTrimmed.length < 3 || usernameTrimmed.length > 50 || !/^[a-zA-Z0-9_]+$/.test(usernameTrimmed)) {
      Alert.alert('Error', 'Username must be 3-50 characters and contain only letters, numbers, and underscores');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const {confirmPassword, ...rawData} = formData;
      // Trim and normalize fields before sending to backend
      const registerData = {
        username: rawData.username.trim(),
        email: rawData.email.trim().toLowerCase(),
        password: rawData.password, // keep exact password
        firstName: rawData.firstName.trim(),
        lastName: rawData.lastName.trim(),
        phone: rawData.phone?.trim() || undefined,
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerData);

      if (response.data.success) {
        const {token, user} = response.data.data;
        await login(token);
        
        Alert.alert(
          'Registration Successful',
          `Welcome ${user.firstName} ${user.lastName}! Your account has been created.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (user.role === 'admin') {
                  navigation.navigate('AdminDashboardScreen');
                } else {
                  navigation.navigate('BillingScreen');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const serverErrors = error.response?.data?.errors;
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const combined = serverErrors.map(e => e.msg || e.message || JSON.stringify(e)).join('\n');
        Alert.alert('Registration Error', combined);
      } else {
        Alert.alert('Registration Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="person-add" size={50} color="#4CAF50" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Smart Trolly</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="account-circle" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#666"
              value={formData.username}
              onChangeText={(value) => updateFormData('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#666"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="phone" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#666"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {paddingRight: 50}]}
              placeholder="Password"
              placeholderTextColor="#666"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, {paddingRight: 50}]}
              placeholder="Confirm Password"
              placeholderTextColor="#666"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
