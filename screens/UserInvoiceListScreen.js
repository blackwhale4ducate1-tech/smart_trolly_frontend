import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, SectionList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';

const STATUS_ORDER = ['draft', 'pending', 'completed', 'cancelled'];
const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const UserInvoiceListScreen = ({ route, navigation }) => {
  const { userId, username } = route.params;
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/invoices`, {
        headers: { Authorization: `Bearer ${jwt?.token}` }
      });
      setInvoices(res.data.data.invoices || []);
    } catch (e) {
      console.error('Load user invoices error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvoices(); }, []);

  const sections = useMemo(() => {
    const groups = invoices.reduce((acc, inv) => {
      const key = (inv.status || 'draft').toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(inv);
      return acc;
    }, {});
    return STATUS_ORDER
      .filter(status => groups[status] && groups[status].length > 0)
      .map(status => ({
        title: STATUS_LABELS[status] || status,
        data: groups[status],
        key: status,
      }));
  }, [invoices]);

  const Item = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('InvoiceDetailScreen', { invoiceId: item.id })}>
      <View style={styles.rowBetween}>
        <Text style={styles.invNo}>{item.invoiceNumber}</Text>
        <Text style={[styles.status, styles[`status_${item.status}`]]}>{item.status}</Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.subtext}>Items: {item.items?.length || 0}</Text>
        <Text style={styles.total}>₹{item.totalAmount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{username}'s Invoices</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4CAF50" size="large" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Item item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No invoices found</Text>}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, padding: 16, backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { color: '#fff', fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
  card: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 12, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  invNo: { color: '#fff', fontWeight: 'bold' },
  status: { color: '#FF9800', textTransform: 'capitalize' },
  status_draft: { color: '#9E9E9E' },
  status_pending: { color: '#FF9800' },
  status_completed: { color: '#4CAF50' },
  status_cancelled: { color: '#F44336' },
  subtext: { color: '#aaa', marginTop: 6 },
  total: { color: '#4CAF50', fontWeight: 'bold', marginTop: 6 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
});

export default UserInvoiceListScreen;
