import React, { useState } from 'react';
import {
 View, Text, TextInput, TouchableOpacity,
 StyleSheet, ActivityIndicator
} from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


// Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyD2GMLmr_9uVPS1TAAgFsMUXDiAGriquRo",
 authDomain: "maps-native-961a0.firebaseapp.com",
 projectId: "maps-native-961a0",
 storageBucket: "maps-native-961a0.appspot.com",
 messagingSenderId: "732193191189",
 appId: "1:732193191189:web:8c5b0a78d9f5ef8aab651c",
 measurementId: "G-CCXVP60L9N"
};


if (getApps().length === 0) {
 initializeApp(firebaseConfig);
}


const auth = getAuth();
const db = getFirestore();


export default function Login({ navigation, onLoginSuccess }) {
 const [isCreatingAccount, setIsCreatingAccount] = useState(false);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [firstName, setFirstName] = useState('');
 const [lastName, setLastName] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [loading, setLoading] = useState(false);


 const toggleForm = () => {
   setIsCreatingAccount(!isCreatingAccount);
   setErrorMessage('');
 };


 const handleSubmit = async () => {
   if (loading) return;
   setErrorMessage('');


   if (!email || !password || (isCreatingAccount && (!firstName || !lastName))) {
     setErrorMessage('Please fill in all required fields.');
     return;
   }


   if (password.length < 6) {
     setErrorMessage('Password must be at least 6 characters.');
     return;
   }


   try {
     setLoading(true);
     if (isCreatingAccount) {
       const { user } = await createUserWithEmailAndPassword(auth, email, password);
       await setDoc(doc(db, 'users', user.uid), {
         firstName,
         lastName,
         email,
         createdAt: new Date(),
       });
     } else {
       await signInWithEmailAndPassword(auth, email, password);
     }


     onLoginSuccess();
     navigation.navigate('Discovery');
   } catch (error) {
     setErrorMessage(error.message);
   } finally {
     setLoading(false);
   }
 };


 return (
   <View style={styles.container}>
     <Text style={styles.headerTitle}>
       {isCreatingAccount ? 'Create New\nAccount' : 'Welcome Back'}
     </Text>
     <Text style={styles.subText}>
       {isCreatingAccount
         ? 'Already registered? Log in here.'
         : 'Don’t have an account? Sign up now.'}
     </Text>


     {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}


     {isCreatingAccount && (
       <>
         <TextInput
           style={styles.input}
           placeholder="First Name"
           value={firstName}
           onChangeText={setFirstName}
         />
         <TextInput
           style={styles.input}
           placeholder="Last Name"
           value={lastName}
           onChangeText={setLastName}
         />
       </>
     )}


     <TextInput
       style={styles.input}
       placeholder="Email"
       value={email}
       onChangeText={setEmail}
       keyboardType="email-address"
       autoCapitalize="none"
     />
     <TextInput
       style={styles.input}
       placeholder="Password"
       value={password}
       onChangeText={setPassword}
       secureTextEntry
     />


     <TouchableOpacity
       style={styles.button}
       onPress={handleSubmit}
       disabled={loading}
     >
       <Text style={styles.buttonText}>
         {loading ? 'Please wait...' : isCreatingAccount ? 'Sign up' : 'Login'}
       </Text>
     </TouchableOpacity>


     <TouchableOpacity onPress={toggleForm}>
       <Text style={styles.switchText}>
         {isCreatingAccount ? 'Already have an account? Log in' : 'Don’t have an account? Sign up'}
       </Text>
     </TouchableOpacity>


     {loading && <ActivityIndicator size="large" color="#4CAF50" />}
   </View>
 );
}
const styles = StyleSheet.create({
 container: {
   flex: 1,
   padding: 24,
   justifyContent: 'center',
   backgroundColor: '#fbfbfb',
 },
 headerTitle: {
   fontSize: 32,
   fontWeight: '800',
   textAlign: 'center',
   color: '#222',
   marginBottom: 10,
 },
 subText: {
   textAlign: 'center',
   marginBottom: 20,
   color: '#666',
   fontSize: 15,
 },
 input: {
   backgroundColor: '#fff',
   borderRadius: 12,
   paddingHorizontal: 18,
   paddingVertical: 14,
   fontSize: 16,
   marginBottom: 14,
   borderWidth: 1.5,
   borderColor: '#e0e0e0',
   shadowColor: '#000',
   shadowOpacity: 0.03,
   shadowOffset: { width: 0, height: 2 },
   shadowRadius: 4,
   elevation: 2,
 },
 button: {
   backgroundColor: '#FFD700',
   paddingVertical: 16,
   borderRadius: 14,
   alignItems: 'center',
   marginTop: 10,
   marginBottom: 14,
   shadowColor: '#000',
   shadowOpacity: 0.15,
   shadowOffset: { width: 0, height: 5 },
   shadowRadius: 8,
   elevation: 6,
 },
 buttonText: {
   color: '#333',
   fontWeight: '700',
   fontSize: 16,
   textTransform: 'uppercase',
 },
 switchText: {
   textAlign: 'center',
   color: '#444',
   fontSize: 15,
   textDecorationLine: 'underline',
   marginTop: 10,
 },
 error: {
   color: '#D8000C',
   marginBottom: 12,
   textAlign: 'center',
   fontSize: 14,
 },
});
