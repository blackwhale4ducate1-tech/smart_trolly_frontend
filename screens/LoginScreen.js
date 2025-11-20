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
} from 'react-native';
import axios from 'axios';
import {API_BASE_URL} from '../config';
import {useAuth} from '../components/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {login} = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: username.trim(),
        password: password,
      });

      if (response.data.success) {
        const {token, user} = response.data.data;
        await login(token);
        
        Alert.alert(
          'Login Successful',
          `Welcome ${user.firstName} ${user.lastName}!`,
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
        Alert.alert('Login Failed', response.data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <Icon name="shopping-cart" size={60} color="#4CAF50" />
        <Text style={styles.title}>Smart Trolly</Text>
        <Text style={styles.subtitle}>Billing System</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, {paddingRight: 50}]}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
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

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Default Admin: admin / admin123
        </Text>
      </View>
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
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
  },
  form: {
    flex: 1,
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
  loginButton: {
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
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    color: '#666',
    fontSize: 16,
  },
  registerLink: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
