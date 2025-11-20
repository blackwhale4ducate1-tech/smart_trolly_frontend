import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import BillingScreen from './screens/BillingScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import UserInvoiceListScreen from './screens/UserInvoiceListScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import InvoiceDetailScreen from './screens/InvoiceDetailScreen';
// import PrivateRoute from './PrivateRoute';


const App = () => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="BillingScreen" component={BillingScreen} />
      <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
      <Stack.Screen name="UserInvoiceListScreen" component={UserInvoiceListScreen} />
      <Stack.Screen name="ProductCreateScreen" component={ProductCreateScreen} />
      <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      <Stack.Screen name="ProductEditScreen" component={ProductEditScreen} />
      <Stack.Screen name="InvoiceDetailScreen" component={InvoiceDetailScreen} />
    
    </Stack.Navigator>
  );
};

export default App;
