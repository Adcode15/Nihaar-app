import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import { useNavigation } from '@react-navigation/native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'; // Importing necessary components from react-native-svg

// Initialize Firestore
const firebaseConfig = {
  apiKey: "AIzaSyCOFFtTGvD-B7rhBva5pX13slbLv3HnZXA",
  authDomain: "nihaar-d5d2f.firebaseapp.com",
  projectId: "nihaar-d5d2f",
  storageBucket: "nihaar-d5d2f.appspot.com",
  messagingSenderId: "532552721085",
  appId: "1:532552721085:web:9ba14efd088d3329d8cdd4",
  measurementId: "G-FFBKMYK2VD"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = getFirestore();
const datacollection = collection(db, "datacolnew");

const AddProducts = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [commission, setCommission] = useState('');
  const [price, setPrice] = useState('');
  const [supname, setSupName] = useState('');
  const [qty, setQty] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();

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
    if (!imageUri) {
      Alert.alert('No Image Selected', 'Please select an image before submitting.');
      return null;
    }

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

  const handleSubmit = async () => {
    try {
      const imageUrl = await uploadImage();
      if (imageUrl) {
        await addDoc(datacollection, {
          name,
          description,
          price: parseFloat(price),
          commission: parseFloat(commission),
          qty,
          supname,
          imageUrl,
          createdAt: serverTimestamp(),
        });
        Alert.alert('Success', 'Product Added successfully!');
        setName('');
        setDescription('');
        setPrice('');
        setCommission('');
        setQty('');
        setSupName('');
        setImageUri(null);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error submitting form: ', error);
      Alert.alert('Error', 'There was a problem submitting the form.');
    }
  };

  return (
    <View style={styles.gradientContainer}>
      {/* Gradient Background using SVG */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#fcc5e4" stopOpacity="1" />
            <Stop offset="15%" stopColor="#fda34b" stopOpacity="1" />
            <Stop offset="35%" stopColor="#ff7882" stopOpacity="1" />
            <Stop offset="52%" stopColor="#c8699e" stopOpacity="1" />

            <Stop offset="71%" stopColor="#7046aa" stopOpacity="1" />
            <Stop offset="87%" stopColor="#0c1db8" stopOpacity="1" />

            <Stop offset="100%" stopColor="#020f75" stopOpacity="1" />
           
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter product name"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Description:</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          placeholder="Enter product description"
          placeholderTextColor="#aaa"
          multiline
          numberOfLines={4}
        />
        <Text style={styles.label}>Price:</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Enter price & Commission"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Supplier Name:</Text>
        <TextInput
          value={supname}
          onChangeText={setSupName}
          style={styles.input}
          placeholder="Enter supplier name"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Commission:</Text>
        <TextInput
          value={commission}
          onChangeText={setCommission}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Enter commission"
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Quantity:</Text>
        <TextInput
          value={qty}
          onChangeText={setQty}
          style={styles.input}
          placeholder="Enter quantity"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Pick Image</Text>
        </TouchableOpacity>
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
          <Text style={styles.submitButtonText}>{uploading ? 'Uploading...' : 'Submit'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#495057',
  },
  imageButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  imageButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddProducts;
