import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../components/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {API_BASE_URL} from '../config';

const DashboardScreen = ({navigation}) => {
  const {data: user, permissions, logout, jwt} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingInvoices: 0,
    todaysSales: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Load different stats based on user role
      if (permissions?.canViewAllInvoices) {
        // Admin can see all stats
        const [productsRes, invoicesRes, lowStockRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/products?limit=1`, {
            headers: {Authorization: `Bearer ${jwt.token}`},
          }),
          axios.get(`${API_BASE_URL}/api/invoices/all?status=pending&limit=1`, {
            headers: {Authorization: `Bearer ${jwt.token}`},
          }),
          axios.get(`${API_BASE_URL}/api/products/low-stock`, {
            headers: {Authorization: `Bearer ${jwt.token}`},
          }),
        ]);

        setStats({
          totalProducts: productsRes.data.data.pagination.totalItems,
          pendingInvoices: invoicesRes.data.data.pagination.totalItems,
          todaysSales: 0, // TODO: Implement today's sales calculation
          lowStockProducts: lowStockRes.data.data.count,
        });
      } else {
        // Regular user can see limited stats
        const invoicesRes = await axios.get(`${API_BASE_URL}/api/invoices/my-invoices?limit=1`, {
          headers: {Authorization: `Bearer ${jwt.token}`},
        });

        setStats({
          totalProducts: 0,
          pendingInvoices: 0,
          todaysSales: 0,
          myInvoices: invoicesRes.data.data.pagination.totalItems,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Scan & Bill',
      subtitle: 'Scan products and create invoices',
      icon: 'qr-code-scanner',
      color: '#4CAF50',
      onPress: () => navigation.navigate('BillingScreen'),
      visible: permissions?.canCreateInvoices,
    },
    {
      title: 'My Invoices',
      subtitle: 'View your invoices',
      icon: 'receipt',
      color: '#2196F3',
      onPress: () => navigation.navigate('InvoiceListScreen'),
      visible: true,
    },
    {
      title: 'Products',
      subtitle: 'Manage products and inventory',
      icon: 'inventory',
      color: '#FF9800',
      onPress: () => navigation.navigate('ProductListScreen'),
      visible: permissions?.canCreateProducts,
    },
    {
      title: 'Admin Panel',
      subtitle: 'Verify invoices and manage system',
      icon: 'admin-panel-settings',
      color: '#9C27B0',
      onPress: () => navigation.navigate('AdminDashboardScreen'),
      visible: permissions?.canVerifyInvoices,
    },
    {
      title: 'Reports',
      subtitle: 'View sales and inventory reports',
      icon: 'analytics',
      color: '#607D8B',
      onPress: () => navigation.navigate('ReportsScreen'),
      visible: permissions?.canViewAllInvoices,
    },
    {
      title: 'Profile',
      subtitle: 'Manage your account settings',
      icon: 'person',
      color: '#795548',
      onPress: () => navigation.navigate('ProfileScreen'),
      visible: true,
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.visible);

  const StatCard = ({title, value, icon, color}) => (
    <View style={[styles.statCard, {borderLeftColor: color}]}>
      <View style={styles.statContent}>
        <View style={styles.statTextContainer}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Icon name={icon} size={30} color={color} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.userRole}>{user?.role === 'admin' ? 'Administrator' : 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
        }>
        
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          
          {permissions?.canViewAllInvoices ? (
            <>
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon="inventory"
                color="#4CAF50"
              />
              <StatCard
                title="Pending Invoices"
                value={stats.pendingInvoices}
                icon="pending-actions"
                color="#FF9800"
              />
              <StatCard
                title="Low Stock Items"
                value={stats.lowStockProducts}
                icon="warning"
                color="#F44336"
              />
            </>
          ) : (
            <StatCard
              title="My Invoices"
              value={stats.myInvoices || 0}
              icon="receipt"
              color="#2196F3"
            />
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {visibleMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}>
              <View style={[styles.menuIcon, {backgroundColor: item.color + '20'}]}>
                <Icon name={item.icon} size={28} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default DashboardScreen;
