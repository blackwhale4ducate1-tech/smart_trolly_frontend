import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './components/AuthContext';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Master from './screens/Master';
import Billing from './screens/Billing';
import Accounts from './screens/Accounts';
import Reports from './screens/Reports';
import Tools from './screens/Tools';
import Settings from './screens/Settings';
import {
  MaterialCommunityIcons,
  FontAwesome6,
  Foundation,
  AntDesign,
  COLORS,
  FONTS,
  icons,
} from './constants';

const CustomDrawerContent = props => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const SideNav = () => {
  const DrawerSideNav = createDrawerNavigator();
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <DrawerSideNav.Navigator
      // initialRouteName="Master"
      backBehavior="history"
      screenOptions={{
        drawerActiveTintColor: COLORS.primary,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: FONTS.body4.fontFamily,
          fontSize: 20,
          fontWeight: '700',
          textDecorationLine: 'underline',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={COLORS.danger}
            />
          </TouchableOpacity>
        ),
      }}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <DrawerSideNav.Screen
        name="Master"
        component={Master}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="view-dashboard"
              color={COLORS.primary}
              size={24}
            />
          ),
          drawerLabelStyle: {
            marginLeft: 10,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
      <DrawerSideNav.Screen
        name="Billing"
        component={Billing}
        options={{
          drawerIcon: () => (
            <FontAwesome6
              name="money-bill-wheat"
              color={COLORS.primary}
              size={24}
            />
          ),
          drawerLabelStyle: {
            marginLeft: 10,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
      <DrawerSideNav.Screen
        name="Accounts"
        component={Accounts}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="note-multiple"
              color={COLORS.primary}
              size={24}
            />
          ),
          drawerLabelStyle: {
            marginLeft: 10,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
      <DrawerSideNav.Screen
        name="Reports"
        component={Reports}
        options={{
          drawerIcon: () => (
            <Foundation
              name="clipboard-notes"
              color={COLORS.primary}
              size={30}
            />
          ),
          drawerLabelStyle: {
            marginLeft: 16,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
      <DrawerSideNav.Screen
        name="Tools"
        component={Tools}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="tooltip-edit"
              color={COLORS.primary}
              size={30}
            />
          ),
          drawerLabelStyle: {
            marginLeft: 4,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
      <DrawerSideNav.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: () => (
            <AntDesign name="setting" color={COLORS.primary} size={30} />
          ),
          drawerLabelStyle: {
            marginLeft: 4,
            fontFamily: FONTS.body4.fontFamily,
            fontSize: 16,
            color: COLORS.black,
          },
        }}
      />
    </DrawerSideNav.Navigator>
  );
};

export default SideNav;

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  
});
