import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useAuth} from '../components/AuthContext';
import BarcodeScanner from '../components/BarcodeScanner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {API_BASE_URL} from '../config';
import Toast from 'react-native-toast-message';

const BillingScreen = ({navigation}) => {
  const {jwt, data: user} = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Do not auto-create invoice on screen mount. We'll create it on first scan/add.

  useEffect(() => {
    let interval;
    if (sessionTimeRemaining > 0) {
      interval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1000) {
            Alert.alert(
              'Session Expired',
              'Your billing session has expired. Please start a new session.',
              [{text: 'OK', onPress: () => navigation.goBack()}]
            );
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionTimeRemaining]);

  const initializeBillingSession = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/invoices/create`,
        {},
        {
          headers: {Authorization: `Bearer ${jwt.token}`},
        }
      );

      if (response.data.success) {
        setCurrentInvoice(response.data.data.invoice);
        setInvoiceItems(response.data.data.invoice.items || []);
        setSessionTimeRemaining(response.data.data.timeRemaining || 1200000); // 20 minutes
        
        Toast.show({
          type: 'success',
          text1: 'Billing Session Started',
          text2: 'You have 20 minutes to complete this invoice',
        });
      }
    } catch (error) {
      console.error('Error initializing billing session:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to start billing session',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = async (code, isQRCode) => {
    setLoading(true);
    try {
      // Search for product by barcode or QR code
      const response = await axios.get(
        `${API_BASE_URL}/api/products/code/${encodeURIComponent(code)}`,
        {
          headers: {Authorization: `Bearer ${jwt.token}`},
        }
      );

      if (response.data.success) {
        const product = response.data.data.product;
        await addProductToInvoice(product);
      } else {
        Alert.alert('Product Not Found', 'No product found with this code');
      }
    } catch (error) {
      console.error('Error scanning product:', error);
      Alert.alert(
        'Scan Error',
        error.response?.data?.message || 'Failed to find product'
      );
    } finally {
      setLoading(false);
    }
  };

  const addProductToInvoice = async (product, quantity = 1) => {
    // Determine invoice to use (create one if needed)
    let invoice = currentInvoice;
    if (!invoice) {
      try {
        const createResp = await axios.post(
          `${API_BASE_URL}/api/invoices/create`,
          {},
          { headers: { Authorization: `Bearer ${jwt.token}` } }
        );
        if (createResp.data.success && createResp.data.data?.invoice) {
          invoice = createResp.data.data.invoice;
          setCurrentInvoice(invoice);
          setSessionTimeRemaining(createResp.data.data.timeRemaining || 1200000);
        } else {
          Alert.alert('Error', 'Failed to start billing session');
          return;
        }
      } catch (e) {
        console.error('Error creating invoice before adding product:', e);
        Alert.alert('Error', e.response?.data?.message || 'Failed to start billing session');
        return;
      }
    }

    if (!invoice?.id) {
      Alert.alert('Error', 'Invalid invoice session');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/invoices/${invoice.id}/items`,
        {
          productId: product.id,
          quantity: quantity,
        },
        {
          headers: {Authorization: `Bearer ${jwt.token}`},
        }
      );

      if (response.data.success) {
        setCurrentInvoice(response.data.data.invoice);
        setInvoiceItems(response.data.data.invoice.items || []);
        
        Toast.show({
          type: 'success',
          text1: 'Product Added',
          text2: `${product.name} added to invoice`,
        });
      }
    } catch (error) {
      console.error('Error adding product to invoice:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add product to invoice'
      );
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromInvoice = async (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.delete(
                `${API_BASE_URL}/api/invoices/${currentInvoice.id}/items/${itemId}`,
                {
                  headers: {Authorization: `Bearer ${jwt.token}`},
                }
              );

              // Refresh invoice data
              await initializeBillingSession();
              
              Toast.show({
                type: 'success',
                text1: 'Item Removed',
                text2: 'Item removed from invoice',
              });
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const completeInvoice = async () => {
    if (!currentInvoice || invoiceItems.length === 0) {
      Alert.alert('Error', 'Cannot complete invoice without items');
      return;
    }

    setShowCustomerModal(true);
  };

  const finalizeInvoice = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/invoices/${currentInvoice.id}/complete`,
        {
          ...customerData,
          paymentMethod: 'cash', // Default to cash
        },
        {
          headers: {Authorization: `Bearer ${jwt.token}`},
        }
      );

      if (response.data.success) {
        setShowCustomerModal(false);
        
        Alert.alert(
          'Invoice Completed',
          'Invoice has been created and sent for admin verification.',
          [
            {
              text: 'Print Invoice',
              onPress: () => printInvoice(response.data.data.invoice.id),
            },
            {
              text: 'New Invoice',
              onPress: () => {
                setCurrentInvoice(null);
                setInvoiceItems([]);
                setCustomerData({name: '', phone: '', email: '', address: ''});
                initializeBillingSession();
              },
            },
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error completing invoice:', error);
      Alert.alert('Error', 'Failed to complete invoice');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = async (invoiceId) => {
    try {
      // This would typically open a PDF or trigger print functionality
      Toast.show({
        type: 'info',
        text1: 'Print Feature',
        text2: 'Print functionality will be implemented based on device capabilities',
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const InvoiceItem = ({item, onRemove}) => (
    <View style={styles.invoiceItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemCode}>Code: {item.productCode || 'N/A'}</Text>
        <View style={styles.itemPricing}>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>₹{item.unitPrice}</Text>
          <Text style={styles.itemTotal}>₹{item.totalAmount}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(item.id)}>
        <Icon name="delete" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  // No need for a blocking loader before any invoice exists; allow user to scan to start

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Billing</Text>
          {sessionTimeRemaining > 0 && (
            <Text style={styles.sessionTimer}>
              Time: {formatTime(sessionTimeRemaining)}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowScanner(true)}>
          <Icon name="qr-code-scanner" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Invoice Summary */}
      {currentInvoice && (
        <View style={styles.invoiceSummary}>
          <Text style={styles.invoiceNumber}>
            Invoice: {currentInvoice.invoiceNumber}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{currentInvoice.subtotal || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST:</Text>
            <Text style={styles.summaryValue}>₹{currentInvoice.totalGst || 0}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₹{currentInvoice.totalAmount || 0}</Text>
          </View>
        </View>
      )}

      {/* Invoice Items */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {invoiceItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="qr-code-scanner" size={60} color="#666" />
            <Text style={styles.emptyText}>Scan products to add to invoice</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}>
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          </View>
        ) : (
          invoiceItems.map((item, index) => (
            <InvoiceItem
              key={index}
              item={item}
              onRemove={removeItemFromInvoice}
            />
          ))
        )}
      </ScrollView>

      {/* Action Buttons */}
      {invoiceItems.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.scanMoreButton}
            onPress={() => setShowScanner(true)}>
            <Icon name="add" size={20} color="#4CAF50" />
            <Text style={styles.scanMoreText}>Scan More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeInvoice}>
            <Text style={styles.completeButtonText}>Complete Invoice</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}

      {/* Customer Details Modal */}
      <Modal
        visible={showCustomerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Customer Details (Optional)</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Customer Name"
              placeholderTextColor="#666"
              value={customerData.name}
              onChangeText={(text) => setCustomerData(prev => ({...prev, name: text}))}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              placeholderTextColor="#666"
              value={customerData.phone}
              onChangeText={(text) => setCustomerData(prev => ({...prev, phone: text}))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email Address"
              placeholderTextColor="#666"
              value={customerData.email}
              onChangeText={(text) => setCustomerData(prev => ({...prev, email: text}))}
              keyboardType="email-address"
            />
            
            <TextInput
              style={[styles.modalInput, styles.addressInput]}
              placeholder="Address"
              placeholderTextColor="#666"
              value={customerData.address}
              onChangeText={(text) => setCustomerData(prev => ({...prev, address: text}))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCustomerModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={finalizeInvoice}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Complete Invoice</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1a1a1a',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sessionTimer: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  invoiceSummary: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#fff',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  invoiceItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  removeButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  scanMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  scanMoreText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#666',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillingScreen;
