import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);

  const headers = { Authorization: `Bearer ${jwt?.token}` };

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
        axios.get(`${API_BASE_URL}/api/admin/invoices/pending`, { headers }),
      ]);
      setUsers(usersRes.data.data.users || []);
      setPendingInvoices(pendingRes.data.data.invoices || []);
    } catch (e) {
      console.error('AdminDashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const verifyInvoice = (invoiceId, approved) => {
    Alert.alert(
      approved ? 'Approve Invoice' : 'Reject Invoice',
      approved ? 'Approve this invoice?' : 'Reject this invoice?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approved ? 'Approve' : 'Reject',
          style: approved ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const res = await axios.put(`${API_BASE_URL}/api/invoices/${invoiceId}/verify`, { approved }, { headers });
              // Optimistically remove from pending list
              setPendingInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
              // If approved and backend returns full invoice, navigate to details
              if (approved && res.data?.success && res.data?.data?.invoice) {
                navigation.navigate('InvoiceDetailScreen', { invoice: res.data.data.invoice });
              } else {
                // For reject case or missing data, fallback to refresh silently
                loadData();
              }
            } catch (e) {
              console.error('Verify error', e);
              Alert.alert('Error', 'Failed to verify invoice');
            }
          }
        }
      ]
    );
  };

  const PendingItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.invoiceNumber}</Text>
        <Text style={styles.cardSub}>User: {item.user?.username}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.amount}>₹{item.totalAmount}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.approve]} onPress={() => verifyInvoice(item.id, true)}>
            <Icon name="check" size={18} color="#fff" />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.reject]} onPress={() => verifyInvoice(item.id, false)}>
            <Icon name="close" size={18} color="#fff" />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const UserRow = ({ item }) => (
    <TouchableOpacity style={styles.userRow} onPress={() => navigation.navigate('UserInvoiceListScreen', { userId: item.id, username: item.username })}>
      <View>
        <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.userSub}>{item.username} • {item.email}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductListScreen')} style={styles.headerBtn}>
          <Icon name="inventory" size={22} color="#4CAF50" />
          <Text style={styles.headerBtnText}>Products</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Pending Invoices</Text>
            {pendingInvoices.length === 0 ? (
              <Text style={styles.emptyText}>No pending invoices</Text>
            ) : (
              pendingInvoices.map(inv => <PendingItem key={inv.id} item={inv} />)
            )}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Users</Text>
          </>
        }
        data={users}
        renderItem={UserRow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Add Product FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProductCreateScreen')}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, padding: 16, backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  emptyText: { color: '#666', marginBottom: 8 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10 },
  cardHeader: { marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#aaa', marginTop: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount: { color: '#4CAF50', fontWeight: 'bold' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginLeft: 8 },
  approve: { backgroundColor: '#4CAF50' },
  reject: { backgroundColor: '#F44336' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  userRow: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { color: '#fff', fontWeight: 'bold' },
  userSub: { color: '#aaa' },
  fab: { position: 'absolute', right: 16, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center', elevation: 4 },
});

export default AdminDashboardScreen;
