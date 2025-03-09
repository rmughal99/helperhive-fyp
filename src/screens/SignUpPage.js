import React, { useState, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, Dimensions, Alert } from 'react-native';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native-animatable';
import * as ImagePicker from 'expo-image-picker';
import logo from '../assets/logo.png';
import { UserContext } from '../context/UserContext';

const { width } = Dimensions.get('window');

const SignUpPage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const { setUser } = useContext(UserContext);

  const handleSignUp = async () => {
  if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match!');
    return;
  }

  try {
    const db = getFirestore();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user) {
      await sendEmailVerification(user);
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
      console.log(`Verification email sent to: ${email}`);
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        isVerified: false, // Initially false until user verifies email
        createdAt: new Date()
      });
      
      // Navigate to Sign In screen after sending verification email
      navigation.navigate('SignIn');
    } else {
      Alert.alert('Error', 'User registration failed.');
    }

    console.log('User signed up successfully.');
  } catch (error) {
    console.error('Error during signup:', error);
    Alert.alert('Signup Failed', error.message);
  }
};

  const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 1: Check if email is verified in Firebase Authentication
    if (!user.emailVerified) {
      Alert.alert('Error', 'Please verify your email before logging in.');
      return;
    }

    // Step 2: Check Firestore's `isVerified` field
    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      
      if (!userData.isVerified) {
        Alert.alert('Error', 'Your account is not verified in Firestore. Please check your email.');
        return;
      }

      // Step 3: If Firebase email is verified, update Firestore `isVerified` to true
      if (!userData.isVerified && user.emailVerified) {
        await updateDoc(userDocRef, { isVerified: true });
        console.log('Firestore updated: User is now verified.');
      }
    }

    setUser(user);
    console.log('User logged in successfully!');
    navigation.navigate('Home'); // Redirect to home page after successful login

  } catch (error) {
    console.error('Error signing in:', error.message);
    Alert.alert('Login Failed', error.message);
  }
};

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length < 6) {
      setPasswordStrength('Password Strength: Weak');
    } else if (text.length < 10) {
      setPasswordStrength('Password Strength: Medium');
    } else {
      setPasswordStrength('Password Strength: Strong');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  return (
    <LinearGradient colors={['#4a90e2', '#005bea']} style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : logo}
          style={styles.profileImage}
          animation="bounceIn"
          delay={500}
          duration={1500}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Create Your Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
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
        onChangeText={handlePasswordChange}
        secureTextEntry
      />
      <Text style={styles.passwordStrength}>{passwordStrength}</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#aaa"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.signinContainer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.signinText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: width * 0.5,
    height: width * 0.3,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signinContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  signinText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  passwordStrength: {
    alignSelf: 'flex-start',
    marginBottom: 15,
    color: '#fff',
  },
});

export default SignUpPage;
