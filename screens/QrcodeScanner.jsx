import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { CameraKitCameraScreen } from 'react-native-camera-kit';  // Import from CameraKit

const GenerateInvoice = () => {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [commission, setCommission] = useState('0');
  const [supname, setSupName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false); // State to show QR scanner

  const db = getFirestore();

  useEffect(() => {
    const parsedBasePrice = parseFloat(basePrice) || 0;
    const parsedCommission = parseFloat(commission) || 0;
    const totalPrice = (parsedBasePrice + parsedCommission).toFixed(2);
    setPrice(totalPrice);
  }, [basePrice, commission]);

  const fetchProductDetails = async (id) => {
    try {
      const productDocRef = doc(db, 'datacolnew', id);
      const productDoc = await getDoc(productDocRef);
      if (productDoc.exists) {
        const productData = productDoc.data();
        setProductName(productData.name || '');
        setBasePrice(productData.price ? productData.price.toString() : '');
        setQty(productData.qty ? productData.qty.toString() : '');
        setSupName(productData.supname || '');
        setCommission('0'); // Default commission or fetch if applicable
      } else {
        Alert.alert('Error', 'Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product details: ', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    }
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      const parsedBasePrice = parseFloat(basePrice) || 0;
      const parsedCommission = parseFloat(commission) || 0;
      const finalPricePerUnit = parsedBasePrice + parsedCommission;
      const parsedQty = parseInt(qty, 10) || 0;
      const totalPrice = (finalPricePerUnit * parsedQty).toFixed(2); 
  
      setPrice(finalPricePerUnit.toFixed(2));
  
      const invoiceNo = `INV-${Date.now()}`;
      const timestamp = new Date().toLocaleString();
  
      const productDocRef = doc(db, 'datacolnew', productId);
      const productDoc = await getDoc(productDocRef);
      
      if (!productDoc.exists) {
        Alert.alert('Error', 'Product not found.');
        return;
      }
  
      const productData = productDoc.data();
      const currentQty = productData.qty ? parseInt(productData.qty, 10) : 0;
  
      if (parsedQty > currentQty) {
        Alert.alert('Error', 'Insufficient quantity in stock.');
        return;
      }
  
      const updatedQty = currentQty - parsedQty;
      await updateDoc(productDocRef, { qty: updatedQty.toString() });
  
      const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { width: 100%; margin: auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .section { margin-bottom: 20px; }
            .section h2 { margin: 0 0 10px; }
            .section p { margin: 0; }
            .invoice-details { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            .invoice-details th, .invoice-details td { border: 1px solid #ddd; padding: 8px; }
            .invoice-details th { background-color: #f4f4f4; }
            .total { font-weight: bold; }
            .footer { margin-top: 20px; }
            .footer h2 { margin: 0; font-size: 16px; }
            .footer p { margin: 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice</h1>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
              <h2>Customer Details</h2>
              <p>Name: ${customerName}</p>
              <p>Mobile: ${customerMobile}</p>
              <p>Payment Mode: ${paymentMode}</p>
            </div>
            <div class="section">
              <h2>Product Details</h2>
              <p>Product ID: ${productId}</p>
              <p>Name: ${productName}</p>
              <p>Supplier: ${supname}</p>
            </div>
            <div class="section">
              <h2>Invoice Summary</h2>
              <table class="invoice-details">
                <tr>
                  <th>Product Name</th>
                  <th>Price (including commission)</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
                <tr>
                  <td>${productName}</td>
                  <td>Rs.${finalPricePerUnit.toFixed(2)}</td>
                  <td>${qty}</td>
                  <td>Rs.${totalPrice}</td>
                </tr>
              </table>
            </div>
            <div class="section">
              <h2>Invoice Information</h2>
              <table class="invoice-details">
                <tr>
                  <th>Invoice Number</th>
                  <td>${invoiceNo}</td>
                </tr>
                <tr>
                  <th>Timestamp</th>
                  <td>${timestamp}</td>
                </tr>
                <tr>
                  <th>Invoice Value</th>
                  <td>Rs.${totalPrice}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              <h2>Nihaar Store Pvt Ltd</h2>
              <p>This is auto-generated and does not require a signature.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  
      const options = {
        html: htmlContent,
        fileName: 'Invoice',
        directory: 'Documents',
      };
  
      const pdf = await RNHTMLtoPDF.convert(options);
      const sanitizedCustomerName = customerName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
      const newFilePath = `${RNFS.DocumentDirectoryPath}/${sanitizedCustomerName}-Invoice.pdf`;
  
      await RNFS.moveFile(pdf.filePath, newFilePath);
      await Share.open({
        url: `file://${newFilePath}`,
        type: 'application/pdf',
        title: 'Share PDF',
      });
  
      Alert.alert('Success', `Invoice saved and shared: ${newFilePath}`);
    } catch (error) {
      console.error('Error generating or sharing PDF: ', error);
      Alert.alert('Error', 'Failed to generate or share invoice.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleQRCodeScanned = (event) => {
    const scannedId = event.nativeEvent.codeStringValue;
    setProductId(scannedId);
    fetchProductDetails(scannedId);
    setShowScanner(false); // Hide the scanner after scanning
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Scan QR</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={showScanner}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowScanner(false)}
        >
          <CameraKitCameraScreen
            showFrame={true}
            scanBarcode={true}
            laserColor={"#FF3D00"}
            frameColor={"#00C853"}
            colorForScannerFrame={'black'}
            onReadCode={handleQRCodeScanned}  // Handling QR code scan
          />
          <Button title="Cancel" onPress={() => setShowScanner(false)} />
        </Modal>
        <Text style={styles.label}>Product ID:</Text>
        <TextInput
          value={productId}
          onChangeText={(text) => {
            setProductId(text);
            if (text) fetchProductDetails(text);
          }}
          style={styles.input}
          placeholder="Enter product ID"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Product Name:</Text>
        <TextInput
          value={productName}
          style={styles.input}
          placeholder="Product name"
          editable={false}
        />
        <Text style={styles.label}> Price:</Text>
        <TextInput
          value={basePrice}
          onChangeText={(text) => setBasePrice(text)}
          keyboardType="numeric"
          style={styles.input}
          placeholder="price"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Quantity:</Text>
        <TextInput
          value={qty}
          onChangeText={(text) => setQty(text)}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Quantity"
          placeholderTextColor="#aaa"
        />
     
        <Text style={styles.label}>Supplier Name:</Text>
        <TextInput
          value={supname}
          style={styles.input}
          placeholder="Supplier name"
          editable={false}
        />
        <Text style={styles.label}>Customer Name:</Text>
        <TextInput
          value={customerName}
          onChangeText={(text) => setCustomerName(text)}
          style={styles.input}
          placeholder="Customer name"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Customer Mobile:</Text>
        <TextInput
          value={customerMobile}
          onChangeText={(text) => setCustomerMobile(text)}
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="Customer mobile"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Payment Mode:</Text>
        <TextInput
          value={paymentMode}
          onChangeText={(text) => setPaymentMode(text)}
          style={styles.input}
          placeholder="Payment mode"
          placeholderTextColor="#aaa"
        />
        <Button
          title={loading ? 'Generating...' : 'Generate Invoice'}
          onPress={handleGenerateInvoice}
          color="#007BFF"
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginVertical: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color:"black"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  buttonTouchable: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#007BFF',
  },
});

export default GenerateInvoice;
