import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, TextInput, RefreshControl, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';

const PAGE_SIZE = 10;

const ProductListScreen = ({ navigation }) => {
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const headers = { Authorization: `Bearer ${jwt?.token}` };

  const fetchProducts = useCallback(async (opts = { reset: false }) => {
    try {
      if (opts.reset) {
        setLoading(true);
        setPage(1);
      }
      const currentPage = opts.reset ? 1 : page;
      const res = await axios.get(`${API_BASE_URL}/api/products`, {
        headers,
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          search: search.trim(),
          isActive: true,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        },
      });
      const list = res.data?.data?.products || [];
      const pagination = res.data?.data?.pagination || {};
      setHasMore((pagination.currentPage || currentPage) < (pagination.totalPages || 1));
      if (opts.reset) {
        setProducts(list);
      } else {
        setProducts(prev => [...prev, ...list]);
      }
    } catch (e) {
      console.error('Load products error', e);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [API_BASE_URL, headers, page, search, refreshing]);

  useEffect(() => { fetchProducts({ reset: true }); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts({ reset: true });
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    await fetchProducts({ reset: false });
  };

  const onSearchSubmit = async () => {
    setPage(1);
    await fetchProducts({ reset: true });
  };

  const ProductRow = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ProductEditScreen', { id: item.id })}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.barcode || 'No barcode'} • ₹{item.salesPrice}</Text>
      </View>
      <Icon name="chevron-right" size={22} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProductCreateScreen')}>
          <Icon name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, barcode, category, brand"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => { setSearch(''); setPage(1); fetchProducts({ reset: true }); }}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4CAF50" size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={ProductRow}
          contentContainerStyle={{ padding: 16 }}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />}
          ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, padding: 16, backgroundColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  searchBox: { margin: 16, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, color: '#fff' },
  row: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#fff', fontWeight: 'bold' },
  sub: { color: '#aaa', marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});

export default ProductListScreen;
