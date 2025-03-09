import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { db } from "../firebase";
import { collection, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ user: null, provider: null, service: null });

  useEffect(() => {
    setLoading(true);
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPendingUsers(usersData.filter(user => !user.isServiceProvider && user.requestStatus === "Pending"));
      setServiceProviders(usersData.filter(user => user.isServiceProvider === true));
      setLoading(false);
    });

    const unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
      const servicesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPendingServices(servicesData.filter(service => service.status === "Pending" && !serviceProviders.some(provider => provider.id === service.userId)));
      setAvailableServices(servicesData.filter(service => service.status === "Approved"));
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeServices();
    };
  }, []);

  const toggleExpand = (type, id) => {
    setExpanded((prev) => ({
      ...prev,
      [type]: prev[type] === id ? null : id,
    }));
  };

  const approveUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { isServiceProvider: true, requestStatus: "Approved" });
      Alert.alert("Success", "User approved as a service provider.");
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  const rejectUser = async (userId) => {
    Alert.alert("Reject Request", "Are you sure you want to reject this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", userId));
            Alert.alert("Rejected", "User request has been rejected.");
          } catch (error) {
            console.error("Error rejecting user:", error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {loading && <ActivityIndicator size="large" color="#4a90e2" />}

      {/* Pending Users */}
      <Text style={styles.sectionTitle}>Pending Users</Text>
      {pendingUsers.map((user) => (
        <View key={user.id} style={styles.card}>
          <TouchableOpacity onPress={() => toggleExpand("user", user.id)}>
            <Text style={styles.cardTitle}>{user.name} - {user.email}</Text>
          </TouchableOpacity>
          {expanded.user === user.id && (
            <View style={styles.expandedContent}>
              <Text style={styles.infoText}>Phone: {user.phone}</Text>
              <TouchableOpacity style={styles.approveButton} onPress={() => approveUser(user.id)}>
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => rejectUser(user.id)}>
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      {/* Service Providers */}
      <Text style={styles.sectionTitle}>Service Providers</Text>
      {serviceProviders.map((provider) => (
        <View key={provider.id} style={styles.card}>
          <TouchableOpacity onPress={() => toggleExpand("provider", provider.id)}>
            <Text style={styles.cardTitle}>{provider.name} - {provider.email}</Text>
          </TouchableOpacity>
          {expanded.provider === provider.id && (
            <View style={styles.expandedContent}>
              <Text style={styles.infoText}>Phone: {provider.phone}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Pending Services */}
      <Text style={styles.sectionTitle}>Pending Services</Text>
      {pendingServices.map((service) => (
        <View key={service.id} style={styles.card}>
          <TouchableOpacity onPress={() => toggleExpand("service", service.id)}>
            <Text style={styles.cardTitle}>{service.name} - {service.category}</Text>
          </TouchableOpacity>
          {expanded.service === service.id && (
            <View style={styles.expandedContent}>
              <Text style={styles.infoText}>Description: {service.description}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Available Services */}
      <Text style={styles.sectionTitle}>Available Services</Text>
      {availableServices.map((service) => (
        <View key={service.id} style={styles.card}>
          <Text style={styles.cardTitle}>{service.name} - {service.category}</Text>
          <Text style={styles.infoText}>Description: {service.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#4a90e2", textAlign: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, color: "#333" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginVertical: 8, shadowOpacity: 0.1, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#4a90e2" },
  expandedContent: { marginTop: 10 },
  infoText: { fontSize: 14, color: "#333" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  approveButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5, alignItems: "center", marginVertical: 5 },
  rejectButton: { backgroundColor: "#f44336", padding: 10, borderRadius: 5, alignItems: "center", marginVertical: 5 },
});