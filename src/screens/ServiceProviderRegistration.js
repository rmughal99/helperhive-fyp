import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { auth, db } from "../firebase";
import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";

const ServiceProviderForm = ({ navigation }) => {
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [availability, setAvailability] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to register a service.");
      navigation.navigate("SignIn");
    }
  }, []);

  const handleSubmit = async () => {
    if (!auth.currentUser) return;

    if (!serviceName || !category || !description || !priceRange || !availability) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    const userId = auth.currentUser.uid;
    setIsSubmitting(true);

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // Add the new service request
      await addDoc(collection(db, "services"), {
        userId,
        serviceName,
        category,
        description,
        priceRange,
        availability,
        createdAt: new Date(),
        status: "Pending",
      });

      // If user is not yet a provider, update their requestStatus
      if (!userData.isServiceProvider) {
        await setDoc(userRef, { requestStatus: "Pending" }, { merge: true });
      }

      Alert.alert("Success", "Your service request has been submitted!");
      navigation.navigate("Profile");
    } catch (error) {
      console.error("Error submitting service:", error);
      Alert.alert("Error", "Could not submit service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Register Your Service</Text>

        <TextInput placeholder="Service Name" value={serviceName} onChangeText={setServiceName} style={styles.input} />
        <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
        <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.textArea} multiline numberOfLines={5} />
        <TextInput placeholder="Price Range" value={priceRange} onChangeText={setPriceRange} style={styles.input} />
        <TextInput placeholder="Availability" value={availability} onChangeText={setAvailability} style={styles.input} />

        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabledButton]} onPress={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceProviderForm;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#005bea" },
  container: { flex: 1, backgroundColor: "#005bea", padding: 20 },
  title: { color: "#fff", fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: { backgroundColor: "#e6e9ee", borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16 },
  textArea: { backgroundColor: "#e6e9ee", borderRadius: 10, padding: 15, marginBottom: 15, textAlignVertical: "top", fontSize: 16 },
  submitButton: { backgroundColor: "#4a90e2", padding: 15, borderRadius: 10, marginTop: 20, alignItems: "center" },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#777" },
});
