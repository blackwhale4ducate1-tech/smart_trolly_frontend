import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert, Share } from 'react-native';
import { Linking } from 'react-native';
import RNPrint from 'react-native-print';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../components/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Row = ({ children, header = false, style }) => (
  <View style={[styles.row, header ? styles.rowHeader : null, style]}>{children}</View>
);

const Cell = ({ children, flex = 1, right = false, bold = false }) => (
  <View style={[styles.cell, { flex }, right && { alignItems: 'flex-end' }]}>
    <Text style={[styles.cellText, bold && styles.bold]}>{children}</Text>
  </View>
);

const InvoiceDetailScreen = ({ route, navigation }) => {
  const { jwt } = useAuth();
  const passedInvoice = route.params?.invoice || null;
  const invoiceId = route.params?.invoiceId || passedInvoice?.id;
  const [invoice, setInvoice] = useState(passedInvoice);
  const [loading, setLoading] = useState(!passedInvoice);

  useEffect(() => {
    const load = async () => {
      if (invoice) return;
      if (!invoiceId) return;
      try {
        setLoading(true);
        // Fallback fetch: use getUserInvoices to get a single invoice if needed
        // Ideally there would be GET /api/invoices/:id; if added, replace with that.
        const res = await axios.get(`${API_BASE_URL}/api/invoices/my-invoices`, {
          headers: { Authorization: `Bearer ${jwt?.token}` },
          params: { page: 1, limit: 1, status: '', includeCompleted: 'true' },
        });
        const found = (res.data?.data?.invoices || []).find(i => i.id === invoiceId);
        if (found) setInvoice(found);
      } catch (e) {
        // silently ignore for now
      } finally {
        setLoading(false);
      }
    };

  
    load();
  }, [invoiceId]);

  if (loading || !invoice) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  const userName = invoice.user ? `${invoice.user.firstName || ''} ${invoice.user.lastName || ''}`.trim() : 'N/A';
  const pdfUrl = `${API_BASE_URL}/api/invoices/${invoice.id}/pdf?inline=true&token=${encodeURIComponent(jwt?.token || '')}`;

  const openPdf = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Error', 'Cannot open PDF URL');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  const sharePdf = async () => {
    try {
      await Share.share({ message: pdfUrl });
    } catch (e) {
      Alert.alert('Error', 'Failed to share PDF link');
    }
  };

  // Build printable HTML content for the invoice
  const buildInvoiceHtml = () => {
    const rows = (invoice.items || []).map(it => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${it.productName || it.product?.name || ''}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${it.unitPrice}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.gstRate}%</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${it.totalAmount}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Invoice ${invoice.invoiceNumber}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding:16px;">
          <h2 style="margin:0 0 8px 0;">INVOICE</h2>
          <div style="margin-bottom:12px;color:#555;">
            <div><strong>Invoice No:</strong> ${invoice.invoiceNumber}</div>
            <div><strong>Status:</strong> ${invoice.status}</div>
            <div><strong>Customer:</strong> ${invoice.customerName || 'Walk-in'}</div>
            <div><strong>User:</strong> ${userName}</div>
          </div>

          <table style="border-collapse:collapse;width:100%;margin-top:8px;">
            <thead>
              <tr style="background:#f3f3f3;">
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Rate</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:center;">GST%</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="margin-top:16px; text-align:right;">
            <div><strong>Subtotal:</strong> ₹${invoice.subtotal}</div>
            <div><strong>GST:</strong> ₹${invoice.totalGst}</div>
            <div style="font-size:18px;"><strong>Total:</strong> ₹${invoice.totalAmount}</div>
          </div>

          <div style="margin-top:24px;color:#777;">Thank you for your business!</div>
        </body>
      </html>
    `;
  };

  // Print using react-native-print
  const printInvoice = async () => {
    try {
      const html = buildInvoiceHtml();
      await RNPrint.print({ html });
    } catch (e) {
      Alert.alert('Error', 'Failed to print invoice');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice {invoice.invoiceNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaBox}>
          <Text style={styles.metaText}>Customer: {invoice.customerName || 'Walk-in'}</Text>
          <Text style={styles.metaText}>User: {userName}</Text>
          <Text style={styles.metaText}>Status: {invoice.status}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6A5ACD' }]} onPress={printInvoice}>
            <Icon name="print" size={18} color="#fff" />
            <Text style={styles.actionText}>Print Invoice</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.actionBtn} onPress={openPdf}>
            <Icon name="picture-as-pdf" size={18} color="#fff" />
            <Text style={styles.actionText}>Open/Download PDF</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1e88e5' }]} onPress={sharePdf}>
            <Icon name="share" size={18} color="#fff" />
            <Text style={styles.actionText}>Share Link</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.table}>
          <Row header>
            <Cell flex={2} bold>Product</Cell>
            <Cell>Qty</Cell>
            <Cell>Rate</Cell>
            <Cell>GST%</Cell>
            <Cell right>Amount</Cell>
          </Row>
          {(invoice.items || []).map((it, idx) => (
            <Row key={idx}>
              <Cell flex={2}>{it.productName || it.product?.name || 'Item'}</Cell>
              <Cell>{it.quantity}</Cell>
              <Cell>{`₹${it.unitPrice}`}</Cell>
              <Cell>{`${it.gstRate}%`}</Cell>
              <Cell right>{`₹${it.totalAmount}`}</Cell>
            </Row>
          ))}
          <Row style={styles.totalsRow}>
            <Cell flex={3} bold>Total</Cell>
            <Cell flex={2} right bold>{`₹${invoice.totalAmount}`}</Cell>
          </Row>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: { paddingTop: 60, padding: 16, backgroundColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 16 },
  metaBox: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 16 },
  metaText: { color: '#ccc', marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  actionText: { color: '#fff', fontWeight: 'bold' },
  table: { backgroundColor: '#1a1a1a', borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  rowHeader: { backgroundColor: '#111' },
  cell: { justifyContent: 'center' },
  cellText: { color: '#fff' },
  bold: { fontWeight: 'bold' },
  totalsRow: { backgroundColor: '#111' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default InvoiceDetailScreen;
