import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthContext';

const toFloatOrNull = (v) => {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  if (t === '') return undefined;
  const n = parseFloat(t);
  return isNaN(n) ? undefined : n;
};

const toIntOrNull = (v) => {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  if (t === '') return undefined;
  const n = parseInt(t, 10);
  return isNaN(n) ? undefined : n;
};

// Top-level memoized Input to avoid remounting on each parent render
const Input = React.memo(({ label, value, onChangeText, keyboardType = 'default', placeholder, right }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || label}
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        blurOnSubmit={false}
        returnKeyType="next"
      />
      {right}
    </View>
  </View>
));

const ProductEditScreen = ({ route, navigation }) => {
  const { id } = route.params || {};
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    barcode: '',
    qrCodeText: '',
    mrp: '',
    salesPrice: '',
    costPrice: '',
    gstRate: '',
    hsnCode: '',
    category: '',
    brand: '',
    unit: '',
    stockQuantity: '',
    minStockLevel: '',
    isActive: true,
  });

  const headers = { Authorization: `Bearer ${jwt?.token}` };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/products/${id}`, { headers });
      if (res.data?.success) {
        const p = res.data.data.product;
        setProduct(p);
        setForm({
          name: p.name || '',
          description: p.description || '',
          barcode: p.barcode || '',
          qrCodeText: p.qrCodeText || '',
          mrp: String(p.mrp ?? ''),
          salesPrice: String(p.salesPrice ?? ''),
          costPrice: String(p.costPrice ?? ''),
          gstRate: String(p.gstRate ?? ''),
          hsnCode: p.hsnCode || '',
          category: p.category || '',
          brand: p.brand || '',
          unit: p.unit || '',
          stockQuantity: String(p.stockQuantity ?? ''),
          minStockLevel: String(p.minStockLevel ?? ''),
          isActive: p.isActive !== false,
        });
      } else {
        Alert.alert('Error', 'Failed to load product');
        navigation.goBack();
      }
    } catch (e) {
      console.error('Load product error', e);
      Alert.alert('Error', 'Failed to load product');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('Validation', 'Product name is required'); return false; }
    const mrp = toFloatOrNull(form.mrp);
    const salesPrice = toFloatOrNull(form.salesPrice);
    const gstRate = toFloatOrNull(form.gstRate);
    if (mrp === undefined || mrp < 0) { Alert.alert('Validation', 'MRP must be a positive number'); return false; }
    if (salesPrice === undefined || salesPrice < 0) { Alert.alert('Validation', 'Sales price must be a positive number'); return false; }
    if (gstRate === undefined || gstRate < 0 || gstRate > 100) { Alert.alert('Validation', 'GST rate must be between 0 and 100'); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        barcode: form.barcode?.trim() || undefined,
        mrp: toFloatOrNull(form.mrp),
        salesPrice: toFloatOrNull(form.salesPrice),
        costPrice: toFloatOrNull(form.costPrice),
        gstRate: toFloatOrNull(form.gstRate),
        hsnCode: form.hsnCode?.trim() || undefined,
        category: form.category?.trim() || undefined,
        brand: form.brand?.trim() || undefined,
        unit: form.unit?.trim() || undefined,
        stockQuantity: toIntOrNull(form.stockQuantity),
        minStockLevel: toIntOrNull(form.minStockLevel),
        isActive: !!form.isActive,
      };

      await axios.put(`${API_BASE_URL}/api/products/${id}`, payload, { headers });
      Alert.alert('Success', 'Product updated', [ { text: 'OK', onPress: () => navigation.goBack() } ]);
    } catch (e) {
      console.error('Update product error', e);
      const serverErrors = e.response?.data?.errors;
      const message = e.response?.data?.message || 'Failed to update product';
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const combined = serverErrors.map(er => er.msg || er.message || JSON.stringify(er)).join('\n');
        Alert.alert('Error', combined);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  // (Input moved to top-level for stability)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        <Input label="Name*" value={form.name} onChangeText={(v) => update('name', v)} />
        <Input label="Description" value={form.description} onChangeText={(v) => update('description', v)} />
        <Input label="Barcode" value={form.barcode} onChangeText={(v) => update('barcode', v)} />
        <Input label="QR Code Text" value={form.qrCodeText} onChangeText={(v) => update('qrCodeText', v)} />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="MRP*" value={form.mrp} onChangeText={(v) => update('mrp', v)} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="Sales Price*" value={form.salesPrice} onChangeText={(v) => update('salesPrice', v)} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Cost Price" value={form.costPrice} onChangeText={(v) => update('costPrice', v)} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="GST %*" value={form.gstRate} onChangeText={(v) => update('gstRate', v)} keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="HSN Code" value={form.hsnCode} onChangeText={(v) => update('hsnCode', v)} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="Category" value={form.category} onChangeText={(v) => update('category', v)} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Brand" value={form.brand} onChangeText={(v) => update('brand', v)} />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="Unit" value={form.unit} onChangeText={(v) => update('unit', v)} placeholder="e.g., pcs, kg, ltr" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input label="Stock Qty" value={form.stockQuantity} onChangeText={(v) => update('stockQuantity', v)} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input label="Min Stock" value={form.minStockLevel} onChangeText={(v) => update('minStockLevel', v)} keyboardType="number-pad" />
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, padding: 16, backgroundColor: '#1a1a1a' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  inputGroup: { marginBottom: 12 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
  inputWrapper: { backgroundColor: '#1a1a1a', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12 },
  input: { height: 48, color: '#fff', fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 12 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CAF50', borderRadius: 12, height: 50, marginTop: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabled: { backgroundColor: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProductEditScreen;
