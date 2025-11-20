import React, {useEffect} from 'react';
import {useAuth} from './components/AuthContext';
import EstimateDayBookDetailReport from './screens/EstimateDayBookDetailReport';
import EstimateItemWiseReport from './screens/EstimateItemWiseReport';
import EstimateReport from './screens/EstimateReport';
import {ProductCategoryProvider} from './components/ProductCategoryContext';
import ViewProductCategory from './screens/ViewProductCategory';
import AddEditProductCategory from './screens/AddEditProductCategory';
import {ProductDetailsProvider} from './components/ProductDetailsContext';
import ViewProductDetails from './screens/ViewProductDetails';
import AddEditProductDetails from './screens/AddEditProductDetails';
import {CustomersProvider} from './components/CustomersContext';
import ViewCustomer from './screens/ViewCustomer';
import AddEditCustomer from './screens/AddEditCustomer';
import {VendorsProvider} from './components/VendorsContext';
import ViewVendor from './screens/ViewVendor';
import AddEditVendor from './screens/AddEditVendor';
import {AccountGroupProvider} from './components/AccountGroupContext';
import ViewAccountGroup from './screens/ViewAccountGroup';
import AddEditAccountGroup from './screens/AddEditAccountGroup';
import {LedgerGroupProvider} from './components/LedgerGroupContext';
import ViewLedgerGroup from './screens/ViewLedgerGroup';
import AddEditLedgerGroup from './screens/AddEditLedgerGroup';
import {StoresProvider} from './components/StoresContext';
import ViewStore from './screens/ViewStore';
import AddEditStore from './screens/AddEditStore';
import {RolesProvider} from './components/RolesContext';
import ViewRole from './screens/ViewRole';
import AddEditRole from './screens/AddEditRole';
import {UsersProvider} from './components/UsersContext';
import ViewUser from './screens/ViewUser';
import AddEditUser from './screens/AddEditUser';
import {ReceiptsProvider} from './components/ReceiptsContext';
import ViewReceipt from './screens/ViewReceipt';
import AddEditReceipt from './screens/AddEditReceipt';
import {PaymentsProvider} from './components/PaymentsContext';
import ViewPayment from './screens/ViewPayment';
import AddEditPayment from './screens/AddEditPayment';
import PriceList from './screens/PriceList';
import {PriceListProvider} from './components/PriceListContext';
import ViewPriceList from './screens/ViewPriceList';
import AddEditPriceList from './screens/AddEditPriceList';
import {PettySalesProvider} from './components/PettySalesContext';
import PettySales from './screens/PettySales';
import PettySalesEdit from './screens/PettySalesEdit';
import PettySalesReport from './screens/PettySalesReport';
import PettySalesDayBookReport from './screens/PettySalesDayBookReport';
import PettySalesDayBookDetailsReport from './screens/PettySalesDayBookDetailsReport';
import PettySalesItemWiseReport from './screens/PettySalesItemWiseReport';
import {PurchaseReturnProvider} from './components/PurchaseReturnContext';
import PurchaseReturn from './screens/PurchaseReturn';
import PurchaseReturnEdit from './screens/PurchaseReturnEdit';
import PurchaseReturnReport from './screens/PurchaseReturnReport';
import PurchaseReturnDayBookReport from './screens/PurchaseReturnDayBookReport';
import PurchaseReturnDayBookDetailReport from './screens/PurchaseReturnDayBookDetailReport';
import PurchaseReturnItemWiseReport from './screens/PurchaseReturnItemWiseReport';
import {ProductionProvider} from './components/ProductionContext';
import Production from './screens/Production';
import ProductionEdit from './screens/ProductionEdit';
import AddEditPurchaseReturnItem from './screens/AddEditPurchaseReturnItem';
import {ProductCompositionProvider} from './components/ProductCompositionContext';
import ProductComposition from './screens/ProductComposition';
import ViewProductComposition from './screens/ViewProductComposition';
import AddEditProductComposition from './screens/AddEditProductComposition';

const ProductCategoriesStack = () => {
  const Stack = createStackNavigator();
  return (
    <ProductCategoryProvider>
      <Stack.Navigator
        initialRouteName="ProductCategories"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="ProductCategories" component={ProductCategories} />
        <Stack.Screen
          name="ViewProductCategory"
          component={ViewProductCategory}
        />
        <Stack.Screen
          name="AddEditProductCategory"
          component={AddEditProductCategory}
        />
      </Stack.Navigator>
    </ProductCategoryProvider>
  );
};

const ProductDetailsStack = () => {
  const Stack = createStackNavigator();
  return (
    <ProductDetailsProvider>
      <Stack.Navigator
        initialRouteName="ProductDetails"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen
          name="ViewProductDetails"
          component={ViewProductDetails}
        />
        <Stack.Screen
          name="AddEditProductDetails"
          component={AddEditProductDetails}
        />
      </Stack.Navigator>
    </ProductDetailsProvider>
  );
};

const CustomersStack = () => {
  const Stack = createStackNavigator();
  return (
    <CustomersProvider>
      <Stack.Navigator
        initialRouteName="Customers"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Customers" component={Customers} />
        <Stack.Screen name="ViewCustomer" component={ViewCustomer} />
        <Stack.Screen name="AddEditCustomer" component={AddEditCustomer} />
      </Stack.Navigator>
    </CustomersProvider>
  );
};

const VendorsStack = () => {
  const Stack = createStackNavigator();
  return (
    <VendorsProvider>
      <Stack.Navigator
        initialRouteName="Vendors"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Vendors" component={Vendors} />
        <Stack.Screen name="ViewVendor" component={ViewVendor} />
        <Stack.Screen name="AddEditVendor" component={AddEditVendor} />
      </Stack.Navigator>
    </VendorsProvider>
  );
};

const AccountGroupStack = () => {
  const Stack = createStackNavigator();
  return (
    <AccountGroupProvider>
      <Stack.Navigator
        initialRouteName="AccountGroup"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="AccountGroup" component={AccountGroup} />
        <Stack.Screen name="ViewAccountGroup" component={ViewAccountGroup} />
        <Stack.Screen
          name="AddEditAccountGroup"
          component={AddEditAccountGroup}
        />
      </Stack.Navigator>
    </AccountGroupProvider>
  );
};

const LedgerGroupStack = () => {
  const Stack = createStackNavigator();
  return (
    <LedgerGroupProvider>
      <Stack.Navigator
        initialRouteName="LedgerGroup"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="LedgerGroup" component={LedgerGroup} />
        <Stack.Screen name="ViewLedgerGroup" component={ViewLedgerGroup} />
        <Stack.Screen
          name="AddEditLedgerGroup"
          component={AddEditLedgerGroup}
        />
      </Stack.Navigator>
    </LedgerGroupProvider>
  );
};

const StoresStack = () => {
  const Stack = createStackNavigator();
  return (
    <StoresProvider>
      <Stack.Navigator
        initialRouteName="Stores"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Stores" component={Stores} />
        <Stack.Screen name="ViewStore" component={ViewStore} />
        <Stack.Screen name="AddEditStore" component={AddEditStore} />
      </Stack.Navigator>
    </StoresProvider>
  );
};

const RolesStack = () => {
  const Stack = createStackNavigator();
  return (
    <RolesProvider>
      <Stack.Navigator
        initialRouteName="Roles"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Roles" component={Roles} />
        <Stack.Screen name="ViewRole" component={ViewRole} />
        <Stack.Screen name="AddEditRole" component={AddEditRole} />
      </Stack.Navigator>
    </RolesProvider>
  );
};

const UsersStack = () => {
  const Stack = createStackNavigator();
  return (
    <UsersProvider>
      <Stack.Navigator
        initialRouteName="Users"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="ViewUser" component={ViewUser} />
        <Stack.Screen name="AddEditUser" component={AddEditUser} />
      </Stack.Navigator>
    </UsersProvider>
  );
};

const ReceiptsStack = () => {
  const Stack = createStackNavigator();
  return (
    <ReceiptsProvider>
      <Stack.Navigator
        initialRouteName="Receipts"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Receipts" component={Receipts} />
        <Stack.Screen name="ViewReceipt" component={ViewReceipt} />
        <Stack.Screen name="AddEditReceipt" component={AddEditReceipt} />
      </Stack.Navigator>
    </ReceiptsProvider>
  );
};

const PaymentsStack = () => {
  const Stack = createStackNavigator();
  return (
    <PaymentsProvider>
      <Stack.Navigator
        initialRouteName="Payments"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Payments" component={Payments} />
        <Stack.Screen name="ViewPayment" component={ViewPayment} />
        <Stack.Screen name="AddEditPayment" component={AddEditPayment} />
      </Stack.Navigator>
    </PaymentsProvider>
  );
};

const SalesBilling = () => {
  const Stack = createStackNavigator();
  return (
    <SalesProvider>
      <Stack.Navigator
        initialRouteName="sales"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="sales" component={Sales} />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </SalesProvider>
  );
};

const SalesEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <SalesProvider>
      <Stack.Navigator
        initialRouteName="salesEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="salesEdit"
          component={SalesEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </SalesProvider>
  );
};

const PettySalesBilling = () => {
  const Stack = createStackNavigator();
  return (
    <PettySalesProvider>
      <Stack.Navigator
        initialRouteName="pettySales"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="pettySales" component={PettySales} />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </PettySalesProvider>
  );
};

const PettySalesEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <PettySalesProvider>
      <Stack.Navigator
        initialRouteName="pettySalesEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="pettySalesEdit"
          component={PettySalesEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </PettySalesProvider>
  );
};

const PurchaseBilling = () => {
  const Stack = createStackNavigator();
  return (
    <PurchaseProvider>
      <Stack.Navigator
        initialRouteName="purchase"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="purchase" component={Purchase} />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </PurchaseProvider>
  );
};

const PurchaseEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <PurchaseProvider>
      <Stack.Navigator
        initialRouteName="purchaseEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="purchaseEdit"
          component={PurchaseEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </PurchaseProvider>
  );
};

const StockTransferBilling = () => {
  const Stack = createStackNavigator();
  return (
    <StockTransferProvider>
      <Stack.Navigator
        initialRouteName="stockTransfer"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="stockTransfer" component={StockTransfer} />
        <Stack.Screen
          name="AddEditStockTransferItem"
          component={AddEditStockTransferItem}
        />
      </Stack.Navigator>
    </StockTransferProvider>
  );
};

const StockTransferEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <StockTransferProvider>
      <Stack.Navigator
        initialRouteName="stockTransferEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="stockTransferEdit"
          component={StockTransferEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen
          name="AddEditStockTransferItem"
          component={AddEditStockTransferItem}
        />
      </Stack.Navigator>
    </StockTransferProvider>
  );
};

const SalesOrderBilling = () => {
  const Stack = createStackNavigator();
  return (
    <SalesProvider>
      <Stack.Navigator
        initialRouteName="salesOrder"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="salesOrder" component={SalesOrder} />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </SalesProvider>
  );
};

const SalesOrderEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <SalesProvider>
      <Stack.Navigator
        initialRouteName="salesOrderEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="salesOrderEdit"
          component={SalesOrderEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </SalesProvider>
  );
};

const OpeningStockBilling = () => {
  const Stack = createStackNavigator();
  return (
    <OpeningStockProvider>
      <Stack.Navigator
        initialRouteName="openingStock"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="openingStock" component={OpeningStock} />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </OpeningStockProvider>
  );
};

const OpeningStockEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <OpeningStockProvider>
      <Stack.Navigator
        initialRouteName="openingStockEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="openingStockEdit"
          component={OpeningStockEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </OpeningStockProvider>
  );
};

const EstimateBilling = () => {
  const Stack = createStackNavigator();
  return (
    <EstimateProvider>
      <Stack.Navigator
        initialRouteName="estimate"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="estimate" component={Estimate} />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </EstimateProvider>
  );
};

const EstimateEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <EstimateProvider>
      <Stack.Navigator
        initialRouteName="estimateEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="estimateEdit"
          component={EstimateEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen name="AddEditSalesItem" component={AddEditSalesItem} />
      </Stack.Navigator>
    </EstimateProvider>
  );
};

const PriceListStack = () => {
  const Stack = createStackNavigator();
  return (
    <PriceListProvider>
      <Stack.Navigator
        initialRouteName="PriceList"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="PriceList" component={PriceList} />
        <Stack.Screen name="ViewPriceList" component={ViewPriceList} />
        <Stack.Screen name="AddEditPriceList" component={AddEditPriceList} />
      </Stack.Navigator>
    </PriceListProvider>
  );
};

const PurchaseReturnBilling = () => {
  const Stack = createStackNavigator();
  return (
    <PurchaseReturnProvider>
      <Stack.Navigator
        initialRouteName="purchaseReturn"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="purchaseReturn" component={PurchaseReturn} />
        <Stack.Screen
          name="AddEditPurchaseReturnItem"
          component={AddEditPurchaseReturnItem}
        />
      </Stack.Navigator>
    </PurchaseReturnProvider>
  );
};

const PurchaseReturnEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <PurchaseReturnProvider>
      <Stack.Navigator
        initialRouteName="purchaseReturnEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="purchaseReturnEdit"
          component={PurchaseReturnEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen
          name="AddEditPurchaseReturnItem"
          component={AddEditPurchaseReturnItem}
        />
      </Stack.Navigator>
    </PurchaseReturnProvider>
  );
};

const ProductionBilling = () => {
  const Stack = createStackNavigator();
  return (
    <ProductionProvider>
      <Stack.Navigator
        initialRouteName="production"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="production" component={Production} />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </ProductionProvider>
  );
};

const ProductionEditBilling = ({route}) => {
  const Stack = createStackNavigator();
  const {invoice_no} = route.params;
  return (
    <ProductionProvider>
      <Stack.Navigator
        initialRouteName="productionEdit"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="productionEdit"
          component={ProductionEdit}
          initialParams={{invoice_no}}
        />
        <Stack.Screen
          name="AddEditPurchaseItem"
          component={AddEditPurchaseItem}
        />
      </Stack.Navigator>
    </ProductionProvider>
  );
};

const ProductCompositionStack = () => {
  const Stack = createStackNavigator();
  return (
    <ProductCompositionProvider>
      <Stack.Navigator
        initialRouteName="ProductComposition"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="ProductComposition"
          component={ProductComposition}
        />
        <Stack.Screen
          name="ViewProductComposition"
          component={ViewProductComposition}
        />
        <Stack.Screen
          name="AddEditProductComposition"
          component={AddEditProductComposition}
        />
      </Stack.Navigator>
    </ProductCompositionProvider>
  );
};

const PrivateRoute = ({navigation}) => {
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    // Redirect to Dashboard when PrivateRoute is accessed
    if (isAuthenticated()) {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('Login');
    }
  }, [isAuthenticated, navigation]);

  // Return null since we're just redirecting
  return null;
};

export default PrivateRoute;
