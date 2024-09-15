import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      const fetchUserName = async () => {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserName(userDoc.data().name);
        }
      };
      fetchUserName();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('AuthScreen'); // Navigate back to the Auth screen after logout
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* SVG for Gradient Background */}
      <Svg height={height} width={width} style={styles.svgBackground}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#6f42c1" stopOpacity="1" />
            <Stop offset="100%" stopColor="#b5dcef" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Logout Button in Top Right Corner */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome, {userName || 'User'} to Nihaar Store</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#6f42c1' }]} // Purple
          onPress={() => navigation.navigate('AddProducts')}
        >
          <Text style={styles.buttonText}>Add Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28a745' }]} // Green
          onPress={() => navigation.navigate('ProductsData')}
        >
          <Text style={styles.buttonText}>Products List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#fd7e14' }]} // Orange
          onPress={() => navigation.navigate('UpdateProducts')}
        >
          <Text style={styles.buttonText}>Update Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#17a2b8' }]} // Teal
          onPress={() => navigation.navigate('GenerateInvoices')}
        >
          <Text style={styles.buttonText}>Generate Invoices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#da3865' }]} // Teal
          onPress={() => navigation.navigate('SalesReports')}
        >
          <Text style={styles.buttonText}>Sales Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  headerContainer: {
    width: '95%',
    height:'10%',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text color
  },
  logoutButton: {
    position: 'absolute', // Absolute positioning for top-right corner
    top: 20, // Adjust based on status bar height
    right: 20,
    padding: 10,
    backgroundColor: '#dc3545', // Red color for logout
    borderRadius: 8,
    zIndex: 1, // Ensure it's on top of other content
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    backgroundColor: '#007bff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Home;
