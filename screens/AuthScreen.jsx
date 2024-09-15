import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // For storing user data
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg'; // For gradient background

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // New name field
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthAction = async () => {
    try {
      if (isSignUp) {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        await firestore().collection('users').doc(userCredential.user.uid).set({
          name: name, // Store user's name in Firestore
          email: email,
        });
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await auth().signInWithEmailAndPassword(email, password);
        navigation.replace('Home'); // Navigate to Home after successful login
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient with SVG */}
      <Svg height="100%" width="100%" style={styles.background}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#eea2a2" stopOpacity="1" />
            <Stop offset="19%" stopColor="#bbc1bf" stopOpacity="1" />
            <Stop offset="42%" stopColor="#57c6e1" stopOpacity="1" />
            <Stop offset="79%" stopColor="#b49fda" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7ac5d8" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Demo Image */}
      <Image
        source={require('../assests/logo_new.png')} // Change to your image path
        style={styles.image}
      />

      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuthAction}>
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleButton} onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleButtonText}>
          {isSignUp ? 'Already have an account? Sign In' : 'New here? Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Cover full screen
  },
  image: {
    width: 150, // Increased size
    height: 150,
    borderRadius: 80, // Make it circular
    alignSelf: 'center',
    marginBottom: 40,
    marginTop:60,
    borderColor: '#fff',
    borderWidth: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#483d8b',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default AuthScreen;
