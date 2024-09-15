import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Alert, ScrollView, Button } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc } from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const UpdateProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [supname, setSupName] = useState('');
  const [commission, setCommission] = useState('');
  const [qty, setQty] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const db = getFirestore();

  const fetchData = async () => {
    try {
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

  useEffect(() => {
    fetchData(); // Fetch data when component mounts
  }, []);

  const handleUpdatePress = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setSupName(product.supname);
    setCommission(product.commission.toString());
    setQty(product.qty.toString());
    setImageUri(product.imageUrl);
    setShowUpdateModal(true);
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: 800,
      height: 800,
    }).then(image => {
      setImageUri(image.path);
    }).catch(error => {
      console.error('ImagePicker Error: ', error);
    });
  };

  const uploadImage = async () => {
    if (!imageUri || imageUri.includes('firebasestorage')) return imageUri;

    const fileName = `${new Date().getTime()}.jpg`;
    const reference = storage().ref(fileName);
    setUploading(true);

    try {
      await reference.putFile(imageUri);
      const imageUrl = await reference.getDownloadURL();
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image: ', error);
      Alert.alert('Error', 'There was a problem uploading the image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      const imageUrl = await uploadImage();
      const productRef = doc(db, 'datacolnew', selectedProduct.id);

      await updateDoc(productRef, {
        name,
        description,
        price: parseFloat(price),
        supname,
        commission: parseFloat(commission),
        qty,
        imageUrl,
      });

      Alert.alert('Success', 'Product updated successfully!');
      setShowUpdateModal(false);
      fetchData(); // Refresh data after update
    } catch (error) {
      console.error('Error updating product: ', error);
      Alert.alert('Error', 'Failed to update product.');
    }
  };

  const renderUpdateModal = () => {
    if (!showUpdateModal) return null;

    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.updateModalContainer}>
          <View style={styles.updateModalContent}>
            <ScrollView contentContainerStyle={styles.updateModalContentInner}>
              <Text style={styles.modalTitle}>Update Product</Text>
              <Text style={styles.label}>Name:</Text>
              <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Enter product name" />
              <Text style={styles.label}>Description:</Text>
              <TextInput value={description} onChangeText={setDescription} style={styles.input} placeholder="Enter description" multiline />
              <Text style={styles.label}>Price:</Text>
              <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} placeholder="Enter price" />
              <Text style={styles.label}>Supplier Name:</Text>
              <TextInput value={supname} onChangeText={setSupName} style={styles.input} placeholder="Enter supplier name" />
              <Text style={styles.label}>Commission:</Text>
              <TextInput value={commission} onChangeText={setCommission} keyboardType="numeric" style={styles.input} placeholder="Enter commission" />
              <Text style={styles.label}>Quantity:</Text>
              <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} placeholder="Enter quantity" />
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>Pick Image</Text>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdateSubmit}>
                <Text style={styles.updateButtonText}>Update Product</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowUpdateModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {renderUpdateModal()}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} alt="Loading..." style={styles.image} />
            ) : (
              <Text style={styles.noImage}>No Image</Text>
            )}
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.description}>Description: {item.description}</Text>
            <Text style={styles.sup}>Supplier: {item.supname}</Text>
            <Text style={styles.qty}>Stock: {item.qty}</Text>
            <Text style={styles.price}>Price Rs. {(item.price + item.commission).toFixed(2)}</Text>
            <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdatePress(item)}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Refresh Products" onPress={fetchData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#36b0c8',
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
    borderColor: '#4242b7',
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
    color: '#38a169',
    marginBottom: 5,
  },
  sup: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff6347',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 5,
  },
  updateButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateModalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  updateModalContent: {
    borderRadius: 25,
    padding: 0,
    flex: 1,
    backgroundColor: '#fff',
  },
  updateModalContentInner: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateProducts;
