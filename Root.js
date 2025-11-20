import React from 'react';
import {AuthProvider} from './components/AuthContext';
import App from './App';
import {NavigationContainer} from '@react-navigation/native';
import {MenuProvider} from 'react-native-popup-menu';
import {PaperProvider, DefaultTheme} from 'react-native-paper';

// Define your custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#24C16B', // Customize primary color if needed
    background: '#FFFFFF', // Set background color to white
    text: '#000000', // Customize text color if needed
    // Add more customizations as needed
  },
};

const Root = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <MenuProvider>
          <PaperProvider theme={theme}>
            <App />
          </PaperProvider>
        </MenuProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};

export default Root;
