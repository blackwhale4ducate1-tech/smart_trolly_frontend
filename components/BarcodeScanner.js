import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Modal, Dimensions, StatusBar, ActivityIndicator, Linking, Platform, PermissionsAndroid} from 'react-native';
import {
  useCameraDevice,
  useCodeScanner,
  Camera,
} from 'react-native-vision-camera';

const {width, height} = Dimensions.get('window');

const BarcodeScanner = ({onClose, onBarcodeScanned}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'code-128', 'code-93', 'code-39', 'ean-8', 'qr', 'pdf-417', 'aztec', 'data-matrix'],
    onCodeScanned: codes => {
      if (scanning && codes.length > 0) {
        const scannedCode = codes[0]?.value;
        const codeType = codes[0]?.type;
        console.log('Code scanned:', scannedCode, 'Type:', codeType);
        
        // Determine if it's a QR code or barcode
        const isQRCode = ['qr', 'pdf-417', 'aztec', 'data-matrix'].includes(codeType);
        
        setScanning(false);
        onBarcodeScanned(scannedCode, isQRCode); // Send code and type back to parent
        onClose(); // Close the scanner view
      }
    },
  });

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      console.log('Checking camera permission...');
      
      if (Platform.OS === 'android') {
        // For Android, use PermissionsAndroid
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to scan barcodes",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        console.log('Android camera permission status:', granted);
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // For iOS, use the vision-camera API
        const status = await Camera.requestCameraPermission();
        console.log('iOS camera permission status:', status);
        setHasPermission(status === 'authorized');
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Show loading state while checking permissions
  if (hasPermission === null) {
    return (
      <Modal visible={true} transparent={false} animationType="slide">
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.errorText}>Initializing camera...</Text>
        </View>
      </Modal>
    );
  }

  if (!device) {
    console.log('No camera device found');
    return (
      <Modal visible={true} transparent={false} animationType="slide">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No camera device found</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
  
  if (!hasPermission) {
    console.log('Camera permission not granted');
    return (
      <Modal visible={true} transparent={false} animationType="slide">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Camera permission not granted</Text>
          <Text style={styles.errorSubText}>Please grant camera permission in your device settings</Text>
          <TouchableOpacity onPress={openSettings} style={styles.settingsButton}>
            <Text style={styles.closeText}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          device={device}
          isActive={true}
          codeScanner={codeScanner}
        />
        <View style={styles.scanBox} />
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorContainer: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
    marginBottom: 50,
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
  },
  settingsButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BarcodeScanner;
