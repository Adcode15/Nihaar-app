import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Alert, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';

const ProductsData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const qrViewRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const datacollection = collection(db, 'datacolnew');
        const snapshot = await getDocs(datacollection);
        const fetchedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }

  const handleQRCode = (id, price, name) => {
    setSelectedQRCode({ id, price, name });
  };

  const saveQRCode = async () => {
    if (!qrViewRef.current) return;

    try {
      const uri = await captureRef(qrViewRef.current, {
        format: 'png',
        quality: 0.8,
      });

      const fileName = `${new Date().getTime()}.png`;
      const path = `${RNFS.PicturesDirectoryPath}/${fileName}`;

      await RNFS.moveFile(uri, path);
      Alert.alert('Success', `QR code saved to gallery as ${fileName}`);

      // Optionally, you can share the saved image
      await Share.open({ url: `file://${path}` });

    } catch (error) {
      console.error('Error saving QR code: ', error);
    }
  };

  const QRCodeWithInfo = ({ id, price, name }) => (
    <View style={styles.qrView}>
      {/* QR code now only contains the id */}
      <QRCode
        value={id} // QR code contains only the id
        size={200}
      />
      {/* Price and name displayed below the QR code */}
      <Text style={styles.qrInfo}>Price: Rs. {price.toFixed(2)}</Text>
      <Text style={styles.qrInfo}>Name: {name}</Text>
    </View>
  );

  const renderQRCodeModal = () => {
    if (!selectedQRCode) return null;

    const { id, price, name } = selectedQRCode;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedQRCode(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.qrView} ref={qrViewRef}>
              <QRCodeWithInfo id={id} price={price} name={name} />
            </View>
            <TouchableOpacity onPress={() => setSelectedQRCode(null)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveQRCode} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save to Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderQRCodeModal()}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} alt='Loading....' style={styles.image} />
            ) : (
              <Text style={styles.noImage}>No Image</Text>
            )}
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.description}>Description: {item.description}</Text>
            <Text style={styles.sup}>Supplier: {item.supname}</Text>

            <Text style={styles.qty}>Stock: {item.qty}</Text>

            <Text style={styles.price}>Price Rs. {(item.price + item.commission).toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => handleQRCode(item.id, item.price, item.name)}
            >
              <Text style={styles.qrButtonText}>Display QR</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // Gradient background using simple View with fallback
   backgroundColor:'#eeaeca',
  },
  listContainer: {
    paddingBottom: 100,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#f24f70', // Subtle border for modern card-like appearance
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 15,
    marginBottom: 20,
  },
  noImage: {
    color: '#bbb',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2b2d42',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  qty: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#38a169', // Vivid green for the stock quantity
    marginBottom: 5,
  },
  sup: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff6347', // A warm red for the supplier's name
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5', // Bright blue for price
    marginBottom: 5,
  },
  qrButton: {
    backgroundColor: '#ff7f50', // Coral color for buttons
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e74c3c', // Bright red for closing
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#3498db', // Cool blue for save button
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrView: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  qrInfo: {
    fontSize: 16,
    marginTop: 10,
    color: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ProductsData;
