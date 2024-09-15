import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'; // For Gradient

const GenerateInvoice = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [scannedProducts, setScannedProducts] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const fetchProductDetails = async (id) => {
    try {
      const productDocRef = doc(db, 'datacolnew', id);
      const productDoc = await getDoc(productDocRef);
      if (productDoc.exists) {
        const productData = productDoc.data();
        return { id, ...productData };
      } else {
        Alert.alert('Error', 'Product not found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching product details: ', error);
      Alert.alert('Error', 'Failed to fetch product details.');
      return null;
    }
  };

  const handleQRCodeScanned = async (e) => {
    const scannedId = e.data;
    const product = await fetchProductDetails(scannedId);
    if (product) {
      setScannedProducts((prevProducts) => [...prevProducts, { ...product, qty: product.qty.toString() }]);
    }
    setShowScanner(false); 
  };

  const handleRemoveProduct = (index) => {
    setScannedProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
  };

  const handleQuantityUpdate = async (id, qtyToSubtract) => {
    try {
      const productDocRef = doc(db, 'datacolnew', id);
      const productDoc = await getDoc(productDocRef);
      if (productDoc.exists) {
        const currentQty = parseInt(productDoc.data().qty, 10);
        const qtySoldToday = productDoc.data().qtySoldToday || 0;

        if (currentQty - qtyToSubtract < 0) {
          Alert.alert('Error', 'Insufficient stock');
          return;
        }
        const updatedQty = currentQty - qtyToSubtract;
        const updatedQtySoldToday = qtySoldToday + qtyToSubtract;

        await updateDoc(productDocRef, { qty: updatedQty.toString(), qtySoldToday: updatedQtySoldToday });
        Alert.alert('Success', 'Quantity updated successfully!');
      } else {
        Alert.alert('Error', 'Product not found for updating.');
      }
    } catch (error) {
      console.error('Error updating quantity: ', error);
      Alert.alert('Error', 'Failed to update quantity in Firebase.');
    }
  };

  const handleGenerateInvoice = async () => {
    setLoading(true);
    try {
      const invoiceNo = `INV-${Date.now()}`;
      const timestamp = new Date().toLocaleString();
      const totalAmount = scannedProducts.reduce((sum, product) => sum + product.price * product.qty, 0);
  
      for (const product of scannedProducts) {
        if (parseInt(product.qty, 10) === 0) {
          Alert.alert('Out of stock', `${product.name} is out of stock.`);
          setLoading(false);
          return;
        }
        await handleQuantityUpdate(product.id, parseInt(product.qty, 10));
      }
  
      const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .invoice-header, .invoice-details, .invoice-summary { margin-bottom: 20px; }
            .invoice-header, .invoice-details { padding: 10px; }
            .invoice-summary { font-weight: bold; text-align: right; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Invoice</h1>
          <p>Date: ${new Date().toLocaleDateString()}</p>
  
          <div class="invoice-header">
            <h2>Customer Details</h2>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Mobile:</strong> ${customerMobile}</p>
            <p><strong>Address:</strong> ${customerAddress}</p>
          </div>
  
          <div class="invoice-details">
            <h2>Product Details</h2>
            <table>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
              ${scannedProducts.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>Rs. ${product.price.toFixed(2)}</td>
                  <td>${product.qty}</td>
                  <td>Rs. ${(product.price * product.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
          </div>
  
          <div class="invoice-summary">
            <p><strong>Total Amount:</strong> Rs. ${totalAmount.toFixed(2)}</p>
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

  const renderQRCodeScanner = () => (
    <Modal
      visible={showScanner}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowScanner(false)}
    >
      <View style={styles.modalContainer}>
        <QRCodeScanner
          onRead={handleQRCodeScanned}
          topContent={<Text style={styles.modalText}>Scan a QR code to add product.</Text>}
          bottomContent={
            <TouchableOpacity style={styles.buttonTouchable} onPress={() => setShowScanner(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          }
        />
      </View>
    </Modal>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* SVG Gradient Background */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#43e97b" />
            <Stop offset="100%" stopColor="#38f9d7" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <Text style={styles.label}>Customer Name:</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            style={styles.input}
            placeholder="Enter customer name"
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Customer Mobile:</Text>
          <TextInput
            value={customerMobile}
            onChangeText={setCustomerMobile}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="Enter customer mobile"
            placeholderTextColor="#aaa"
          />
          <Text style={styles.label}>Customer Address:</Text>
          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            style={styles.input}
            placeholder="Enter customer address"
            placeholderTextColor="#aaa"
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.scanButton}>
              <Text style={styles.scanButtonText}>Scan QR</Text>
            </TouchableOpacity>
          </View>

          {renderQRCodeScanner()}

          {scannedProducts.map((product, index) => (
            <View key={product.id} style={styles.productContainer}>
              <Text style={styles.productText}>Product: {product.name}</Text>
              <Text style={styles.productText}>Price: Rs. {product.price.toFixed(2)}</Text>
              <TextInput
                value={product.qty}
                onChangeText={(qty) => {
                  const updatedProducts = [...scannedProducts];
                  updatedProducts[index].qty = qty;
                  setScannedProducts(updatedProducts);
                }}
                keyboardType="numeric"
                editable={parseInt(product.qty, 10) !== 0}
                placeholder={parseInt(product.qty, 10) === 0 ? "Out of stock" : "Enter quantity"}
                style={[
                  styles.input,
                  parseInt(product.qty, 10) === 0 && styles.inputDisabled,
                ]}
              />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveProduct(index)}>
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Button
            title={loading ? 'Generating Invoice...' : 'Generate Invoice'}
            onPress={handleGenerateInvoice}
            color="#FF6347"
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    marginHorizontal: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#FF6347',
    padding: 12,
    width: '100%',
    margin:2,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight:'bold',
    fontSize: 18,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: 'black',
    backgroundColor: '#f9f9f9',
  },
  inputDisabled: {
    backgroundColor: '#e0e0e0',
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  buttonTouchable: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#FF6347',
  },
  productContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    position: 'relative',
  },
  productText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  removeButton: {
    position: 'absolute',
    right: 6,
    top: 10,
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GenerateInvoice;
