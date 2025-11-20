import React, { useState, useCallback } from 'react';
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

// Top-level memoized Input component to avoid remounting on parent re-renders
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

const ProductCreateScreen = ({ navigation }) => {
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    barcode: '',
    qrCodeText: '',
    mrp: '',
    salesPrice: '',
    costPrice: '',
    gstRate: '0',
    hsnCode: '',
    category: '',
    brand: '',
    unit: '',
    stockQuantity: '',
    minStockLevel: '',
  });

  // Use useCallback to prevent unnecessary re-renders
  const update = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const validate = () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Product name is required');
      return false;
    }
    const mrp = toFloatOrNull(form.mrp);
    const salesPrice = toFloatOrNull(form.salesPrice);
    const gstRate = toFloatOrNull(form.gstRate);
    if (mrp === undefined || mrp < 0) {
      Alert.alert('Validation', 'MRP must be a positive number');
      return false;
    }
    if (salesPrice === undefined || salesPrice < 0) {
      Alert.alert('Validation', 'Sales price must be a positive number');
      return false;
    }
    if (gstRate === undefined || gstRate < 0 || gstRate > 100) {
      Alert.alert('Validation', 'GST rate must be between 0 and 100');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        barcode: form.barcode?.trim() || undefined,
        qrCodeText: form.qrCodeText?.trim() || undefined,
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
      };

      const res = await axios.post(`${API_BASE_URL}/api/products`, payload, {
        headers: { Authorization: `Bearer ${jwt?.token}` },
      });

      if (res.data?.success) {
        Alert.alert('Success', 'Product created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', res.data?.message || 'Failed to create product');
      }
    } catch (e) {
      console.error('Create product error', e);
      const serverErrors = e.response?.data?.errors;
      const message = e.response?.data?.message || 'Failed to create product';
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        const combined = serverErrors.map(er => er.msg || er.message || JSON.stringify(er)).join('\n');
        Alert.alert('Error', combined);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  // (Input moved to top-level to keep component identity stable)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.form} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <Input 
          label="Name*" 
          value={form.name} 
          onChangeText={(v) => update('name', v)} 
        />
        <Input 
          label="Description" 
          value={form.description} 
          onChangeText={(v) => update('description', v)} 
        />
        <Input 
          label="Barcode" 
          value={form.barcode} 
          onChangeText={(v) => update('barcode', v)} 
        />
        <Input 
          label="QR Code Text" 
          value={form.qrCodeText} 
          onChangeText={(v) => update('qrCodeText', v)} 
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input 
              label="MRP*" 
              value={form.mrp} 
              onChangeText={(v) => update('mrp', v)} 
              keyboardType="decimal-pad" 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input 
              label="Sales Price*" 
              value={form.salesPrice} 
              onChangeText={(v) => update('salesPrice', v)} 
              keyboardType="decimal-pad" 
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input 
              label="Cost Price" 
              value={form.costPrice} 
              onChangeText={(v) => update('costPrice', v)} 
              keyboardType="decimal-pad" 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input 
              label="GST %*" 
              value={form.gstRate} 
              onChangeText={(v) => update('gstRate', v)} 
              keyboardType="decimal-pad" 
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input 
              label="HSN Code" 
              value={form.hsnCode} 
              onChangeText={(v) => update('hsnCode', v)} 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input 
              label="Category" 
              value={form.category} 
              onChangeText={(v) => update('category', v)} 
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input 
              label="Brand" 
              value={form.brand} 
              onChangeText={(v) => update('brand', v)} 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input 
              label="Unit" 
              value={form.unit} 
              onChangeText={(v) => update('unit', v)} 
              placeholder="e.g., pcs, kg, ltr" 
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input 
              label="Stock Qty" 
              value={form.stockQuantity} 
              onChangeText={(v) => update('stockQuantity', v)} 
              keyboardType="number-pad" 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input 
              label="Min Stock" 
              value={form.minStockLevel} 
              onChangeText={(v) => update('minStockLevel', v)} 
              keyboardType="number-pad" 
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabled]} 
          onPress={submit} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Icon name="save" size={20} color="#fff" />
              <Text style={styles.saveText}>Save Product</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    padding: 16, 
    backgroundColor: '#1a1a1a' 
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  inputGroup: { marginBottom: 12 },
  label: { color: '#aaa', marginBottom: 6, fontSize: 12 },
  inputWrapper: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#333', 
    paddingHorizontal: 12 
  },
  input: { height: 48, color: '#fff', fontSize: 16 },
  row: { flexDirection: 'row', marginBottom: 12 },
  saveButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: '#4CAF50', 
    borderRadius: 12, 
    height: 50, 
    marginTop: 8 
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabled: { backgroundColor: '#666' },
});

export default ProductCreateScreen;