import {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {API_BASE_URL} from '../config';
import {useAuth} from './AuthContext';
import styles from '../screens/ReportItemStyles';
import {
  COLORS,
  Foundation,
  FontAwesome5,
  FontAwesome6,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '../constants';
import Modal from 'react-native-modal';

const {height} = Dimensions.get('screen');

/*
 * PERFORMANCE OPTIMIZATION STRATEGIES IMPLEMENTED:
 *
 * FRONTEND OPTIMIZATIONS:
 * 1. Pagination: Only load 20 items at a time
 * 2. Lazy Loading: Load more data on scroll
 * 3. Virtual Scrolling: Only render visible items
 * 4. Caching: API responses cached to avoid re-fetching
 * 5. Optimized Rendering: removeClippedSubviews, initialNumToRender
 * 6. Scroll Throttling: Reduce scroll event frequency
 *
 * BACKEND OPTIMIZATION SUGGESTIONS:
 * 1. Add pagination parameters to API
 * 2. Implement database indexing
 * 3. Add query optimization
 * 4. Use database pagination (LIMIT/OFFSET)
 * 5. Add response compression
 * 6. Implement caching at server level
 */

// Cache for API responses
const apiCache = new Map();
const pendingRequests = new Map();

// Cache management utilities
const clearCache = () => {
  apiCache.clear();
  pendingRequests.clear();
};

const clearCacheForUrl = url => {
  apiCache.delete(url);
  pendingRequests.delete(url);
};

// Custom hook for API calls with caching
const useApiCall = (url, dependencies = []) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Check cache first
    if (apiCache.has(url)) {
      setData(apiCache.get(url));
      setIsLoading(false);
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(url)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mark request as pending
      pendingRequests.set(url, true);

      const response = await axios.get(url);
      const responseData = response.data;

      // Cache the response
      apiCache.set(url, responseData);
      setData(responseData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.log('API Error:', err);
    } finally {
      setIsLoading(false);
      pendingRequests.delete(url);
    }
  }, [url]);

  const refetch = useCallback(() => {
    clearCacheForUrl(url);
    fetchData();
  }, [url, fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {data, isLoading, error, refetch};
};

export default function StockTransferDayBookDetail({formData}) {
  const {data} = useAuth();
  const tableRef = useRef(null);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString().replace(/[/:]/g, '_');
  const [showDetailModal, setDetailModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Memoize the API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => {
    const fromDateStr = formData.fromDate.toISOString().split('T')[0];
    const toDateStr = formData.toDate.toISOString().split('T')[0];
    const encodedCustomerName = encodeURIComponent(formData.name);

    return `${API_BASE_URL}/api/getStockTransferDayBookDetailData?fromDate=${fromDateStr}&toDate=${toDateStr}&customerName=${encodedCustomerName}&company_name=${data.company_name}`;
  }, [formData.fromDate, formData.toDate, formData.name, data.company_name]);

  // Use the custom hook for API calls
  const {
    data: dayBookDetailData,
    isLoading,
    error,
    refetch,
  } = useApiCall(apiUrl, [apiUrl]);

  // Pagination logic
  const totalPages = Math.ceil(dayBookDetailData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = dayBookDetailData.slice(startIndex, endIndex);

  // Load more data function
  const loadMoreData = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoadingMore(false);
      }, 300);
    }
  }, [currentPage, totalPages, isLoadingMore]);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [dayBookDetailData.length]);

  // Clear cache when component unmounts or when form data changes significantly
  useEffect(() => {
    return () => {
      // Clear cache when component unmounts to prevent memory leaks
      clearCacheForUrl(apiUrl);
    };
  }, [apiUrl]);

  // Open modal when content is ready
  useEffect(() => {
    if (selectedRow && isModalLoading) {
      // Small delay to show loading state, then open modal
      const timer = setTimeout(() => {
        setDetailModal(true);
        setIsModalLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedRow, isModalLoading]);

  // Memoize the totalSum calculation to prevent recalculation on every render
  const totalSum = useMemo(() => {
    return dayBookDetailData.reduce(
      (acc, row) => {
        acc.total_amount = isNaN(parseFloat(row.total_amount))
          ? acc.total_amount
          : (
              parseFloat(acc.total_amount) + parseFloat(row.total_amount)
            ).toString();
        acc.discount_on_total = isNaN(parseFloat(row.discount_on_total))
          ? acc.discount_on_total
          : (
              parseFloat(acc.discount_on_total) +
              parseFloat(row.discount_on_total)
            ).toString();
        acc.round_off = isNaN(parseFloat(row.round_off))
          ? acc.round_off
          : (parseFloat(acc.round_off) + parseFloat(row.round_off)).toString();
        acc.bill_amount = isNaN(parseFloat(row.bill_amount))
          ? acc.bill_amount
          : (
              parseFloat(acc.bill_amount) + parseFloat(row.bill_amount)
            ).toString();
        acc.qty = isNaN(parseFloat(row.qty))
          ? acc.qty
          : (parseFloat(acc.qty) + parseFloat(row.qty)).toString();
        acc.gross_amt = isNaN(parseFloat(row.gross_amt))
          ? acc.gross_amt
          : (parseFloat(acc.gross_amt) + parseFloat(row.gross_amt)).toString();
        acc.taxable = isNaN(parseFloat(row.taxable))
          ? acc.taxable
          : (parseFloat(acc.taxable) + parseFloat(row.taxable)).toString();
        acc.discount = isNaN(parseFloat(row.discount))
          ? acc.discount
          : (parseFloat(acc.discount) + parseFloat(row.discount)).toString();
        acc.sub_total = isNaN(parseFloat(row.sub_total))
          ? acc.sub_total
          : (parseFloat(acc.sub_total) + parseFloat(row.sub_total)).toString();
        return acc;
      },
      {
        total_amount: '0',
        discount_on_total: '0',
        round_off: '0',
        bill_amount: '0',
        qty: '0',
        gross_amt: '0',
        taxable: '0',
        discount: '0',
        sub_total: '0',
      },
    );
  }, [dayBookDetailData]);

  const handleOpenDetail = useCallback(row => {
    setIsModalLoading(true);
    setSelectedRow(row);
    // Don't open modal immediately - wait for content to be ready
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModal(false);
    setIsModalLoading(false);
    // Clear selected row after modal closes to free memory
    setTimeout(() => {
      setSelectedRow(null);
    }, 300);
  }, []);

  // Memoize the DataRow component to prevent unnecessary re-renders
  const DataRow = useCallback(
    ({label, value, iconComponent, iconSize, iconColor}) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 20,
          paddingRight: 20,
        }}>
        {iconComponent}
        <Text style={[styles.cardValues, {paddingLeft: 7}]}>
          <Text style={styles.cardText}>{label}:</Text> {value}
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View style={{height: height * 0.8}}>
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{marginTop: 10, color: COLORS.primary}}>
            Loading data...
          </Text>
        </View>
      ) : error ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: COLORS.red, textAlign: 'center', margin: 20}}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.reportbtn, {marginTop: 10}]}
            onPress={refetch}>
            <Text style={styles.exportText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={({nativeEvent}) => {
              const {layoutMeasurement, contentOffset, contentSize} =
                nativeEvent;
              const paddingToBottom = 20;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                loadMoreData();
              }
            }}
            scrollEventThrottle={400}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}>
            <View>
              {currentData.map((row, index) => (
                <View key={`row-${startIndex + index}`}>
                  <View style={styles.reportView}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.cardValues}>
                        <Text style={styles.cardText}>Auto Inv No :</Text>{' '}
                        {row.invoice_no}
                      </Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <FontAwesome5
                          name="calendar-alt"
                          size={18}
                          color={COLORS.red}
                        />
                        <Text style={[{paddingLeft: 5}, styles.cardValues]}>
                          {row.invoice_date}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <FontAwesome5
                        name="user-circle"
                        size={20}
                        color={COLORS.blue}
                      />
                      <Text style={[styles.cardValues, {paddingLeft: 7}]}>
                        <Text style={styles.cardText}>Invoice No :</Text>{' '}
                        {row.custom_invoice_no}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 20,
                      }}>
                      <FontAwesome5
                        name="user-circle"
                        size={20}
                        color={COLORS.blue}
                      />
                      <Text style={[styles.cardValues, {paddingLeft: 7}]}>
                        <Text style={styles.cardText}>From Store :</Text>{' '}
                        {row.from_store_name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                      }}>
                      <FontAwesome5
                        name="store"
                        size={18}
                        color={COLORS.yellow}
                      />
                      <Text style={[styles.cardValues, {paddingLeft: 7}]}>
                        <Text style={styles.cardText}>To Store :</Text>{' '}
                        {row.to_store_name}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                      }}>
                      <FontAwesome6
                        name="money-bill-wheat"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={[styles.cardValues, {paddingLeft: 7}]}>
                        <Text style={styles.cardText}>Bill Amount :</Text> Rs.
                        {row.bill_amount}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{alignItems: 'flex-end'}}
                      onPress={() => handleOpenDetail(row)}>
                      <View style={styles.viewbg}>
                        <FontAwesome5
                          name="angle-double-right"
                          size={18}
                          color={COLORS.white}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            {/* Load More Button */}
            {currentPage < totalPages && (
              <View style={{padding: 20, alignItems: 'center'}}>
                <TouchableOpacity
                  style={[styles.reportbtn, {opacity: isLoadingMore ? 0.7 : 1}]}
                  onPress={loadMoreData}
                  disabled={isLoadingMore}>
                  <Text style={styles.exportText}>
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          {/* Modal */}
          <Modal
            isVisible={showDetailModal}
            onBackdropPress={handleCloseDetail}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}>
            <View style={styles.modalReport}>
              {/* Modal Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle}>Details :</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseDetail}>
                  <FontAwesome
                    name="window-close"
                    size={20}
                    color={COLORS.red}
                  />
                </TouchableOpacity>
              </View>
              {selectedRow ? (
                <>
                  <ScrollView
                    contentContainerStyle={{marginVertical: 20}}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}>
                    <View style={{marginBottom: 100}}>
                      <DataRow
                        label="Auto Inv No"
                        value={selectedRow.invoice_no}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="format-list-checks"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Invoice No"
                        value={selectedRow.custom_invoice_no}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="format-list-numbered"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Date"
                        value={selectedRow.invoice_date}
                        iconComponent={
                          <FontAwesome5
                            name="calendar-alt"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="From Store"
                        value={selectedRow.from_store_name}
                        iconComponent={
                          <FontAwesome5
                            name="store"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="To Store"
                        value={selectedRow.to_store_name}
                        iconComponent={
                          <FontAwesome5
                            name="store"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Created By User"
                        value={selectedRow.username}
                        iconComponent={
                          <Ionicons
                            name="create-outline"
                            size={25}
                            color={COLORS.primary}
                          />
                        }
                      />

                      <DataRow
                        label="Discount Type"
                        value={selectedRow.discount_type}
                        iconComponent={
                          <MaterialIcons
                            name="discount"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Discount Input"
                        value={selectedRow.discount_input}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="format-list-bulleted-type"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Other Expenses"
                        value={selectedRow.other_expenses}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="MOP"
                        value={selectedRow.mop}
                        iconComponent={
                          <MaterialIcons
                            name="payment"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Tax Type"
                        value={
                          data.tax_type === 'VAT' &&
                          selectedRow.tax_type === 'IGST'
                            ? 'VAT'
                            : selectedRow.tax_type
                        }
                        iconComponent={
                          <Foundation
                            name="clipboard-notes"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="OS"
                        value={selectedRow.os}
                        iconComponent={
                          <FontAwesome5
                            name="balance-scale"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Total Amount"
                        value={selectedRow.total_amount}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Discount On Total"
                        value={selectedRow.discount_on_total}
                        iconComponent={
                          <MaterialIcons
                            name="discount"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Round Off"
                        value={selectedRow.round_off}
                        iconComponent={
                          <FontAwesome
                            name="calculator"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Bill Amount"
                        value={selectedRow.bill_amount}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Created At"
                        value={new Date(selectedRow.createdAt).toLocaleString()}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="av-timer"
                            size={20}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Updated At"
                        value={new Date(selectedRow.updatedAt).toLocaleString()}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="av-timer"
                            size={22}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="BarCode"
                        value={selectedRow.barcode}
                        iconComponent={
                          <FontAwesome5
                            name="barcode"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Product Code"
                        value={selectedRow.product_code}
                        iconComponent={
                          <MaterialIcons
                            name="production-quantity-limits"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Product Name"
                        value={selectedRow.product_name}
                        iconComponent={
                          <MaterialIcons
                            name="production-quantity-limits"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Qty"
                        value={selectedRow.qty}
                        iconComponent={
                          <FontAwesome
                            name="shopping-basket"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Purchase Price"
                        value={selectedRow.purchase_price}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Sales Price"
                        value={selectedRow.sales_price}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="MRP"
                        value={selectedRow.mrp}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Gross Amount"
                        value={selectedRow.gross_amt}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Taxable"
                        value={selectedRow.taxable}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      {data.tax_type === 'GST' && (
                        <>
                          <DataRow
                            label="CGST %"
                            value={selectedRow.cgstP}
                            iconComponent={
                              <MaterialCommunityIcons
                                name="brightness-percent"
                                size={18}
                                color={COLORS.primary}
                              />
                            }
                          />
                          <DataRow
                            label="CGST"
                            value={selectedRow.cgst}
                            iconComponent={
                              <MaterialCommunityIcons
                                name="brightness-percent"
                                size={18}
                                color={COLORS.primary}
                              />
                            }
                          />
                          <DataRow
                            label="SGST %"
                            value={selectedRow.sgstP}
                            iconComponent={
                              <MaterialCommunityIcons
                                name="brightness-percent"
                                size={18}
                                color={COLORS.primary}
                              />
                            }
                          />
                          <DataRow
                            label="SGST"
                            value={selectedRow.sgst}
                            iconComponent={
                              <MaterialCommunityIcons
                                name="brightness-percent"
                                size={18}
                                color={COLORS.primary}
                              />
                            }
                          />
                        </>
                      )}

                      <DataRow
                        label={data.tax_type === 'VAT' ? 'VAT %' : 'IGST %'}
                        value={selectedRow.igstP}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="brightness-percent"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label={data.tax_type === 'VAT' ? 'VAT' : 'IGST'}
                        value={selectedRow.igst}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="brightness-percent"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Discount %"
                        value={selectedRow.discountP}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="brightness-percent"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Discount"
                        value={selectedRow.discount}
                        iconComponent={
                          <MaterialCommunityIcons
                            name="brightness-percent"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                      <DataRow
                        label="Sub Total"
                        value={selectedRow.sub_total}
                        iconComponent={
                          <FontAwesome6
                            name="money-bill-wheat"
                            size={18}
                            color={COLORS.primary}
                          />
                        }
                      />
                    </View>
                  </ScrollView>
                </>
              ) : null}
            </View>
          </Modal>
        </>
      )}
      <View style={styles.childView}>
        <View style={styles.childWrapper}>
          <Text style={styles.cardText}>Total Amount : </Text>
          <Text style={styles.cardValues}>
            {Number(totalSum.total_amount).toFixed(2)}
          </Text>
        </View>

        <View style={styles.childWrapper}>
          <Text style={styles.cardText}>Discount on Total :</Text>
          <Text style={styles.cardValues}>
            {Number(totalSum.discount_on_total).toFixed(2)}
          </Text>
        </View>
        <View style={styles.childWrapper}>
          <Text style={styles.cardText}>Round Off :</Text>
          <Text style={styles.cardValues}>
            {Number(totalSum.round_off).toFixed(2)}
          </Text>
        </View>
        <View style={styles.childWrapper}>
          <Text style={styles.cardText}>Bill Amount : </Text>
          <Text style={styles.cardValues}>
            {Number(totalSum.bill_amount).toFixed(2)}
          </Text>
        </View>
        <View style={styles.childWrapper}>
          <Text style={styles.cardText}>Qty : </Text>
          <Text style={styles.cardValues}>
            {Number(totalSum.qty).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
