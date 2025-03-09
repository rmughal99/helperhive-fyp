import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Navbar from "./navbar";

const BookingsScreen = ({ route, navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const bookingsRef = collection(db, "bookings");

    // Fetch bookings where the current user is either the customer or service provider
    const q = query(
      bookingsRef,
      where("participants", "array-contains", user.uid) // Fetch both user & provider bookings
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if a service is passed from ServiceDetails for booking
  useEffect(() => {
    if (route.params?.service && route.params?.selectedDate) {
      handleNewBooking(route.params.service, route.params.selectedDate);
    }
  }, [route.params?.service, route.params?.selectedDate]);

  const handleNewBooking = async (service, selectedDate) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to book a service.");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        providerId: service.userId,
        participants: [user.uid, service.userId],
        serviceId: service.id,
        serviceName: service.serviceName,
        providerName: service.providerName || "Unknown",
        status: "Pending",
        bookingDateTime: selectedDate.toISOString(), // Save selected date & time
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", "Your booking has been placed!");
    } catch (error) {
      console.error("Error booking service:", error);
      Alert.alert("Error", "Failed to book service.");
    }
  };

  const cancelBooking = async (bookingId) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), { status: "Canceled" });
          } catch (error) {
            console.error("Error canceling booking:", error);
          }
        },
      },
    ]);
  };

  const acceptBooking = async (bookingId) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: "Confirmed" });
      Alert.alert("Booking Accepted", "You have accepted this booking.");
    } catch (error) {
      console.error("Error accepting booking:", error);
    }
  };

  const rejectBooking = async (bookingId) => {
    Alert.alert("Reject Booking", "Are you sure you want to reject this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "bookings", bookingId), { status: "Rejected" });
          } catch (error) {
            console.error("Error rejecting booking:", error);
          }
        },
      },
    ]);
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingInfo}>
        <Text style={styles.serviceText}>{item.serviceName}</Text>
        <Text style={styles.providerText}>
          {item.userId === user.uid ? "Provider" : "Customer"}: {item.providerName}
        </Text>
        <Text style={styles.dateText}>
          Date & Time: {new Date(item.bookingDateTime).toLocaleString()}
        </Text>
        <Text style={[styles.status, styles[item.status]]}>{item.status}</Text>
      </View>

      {/* Show "Cancel" button only for users who booked the service */}
      {item.status === "Pending" && item.userId === user.uid && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelBooking(item.id)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {/* Show "Accept" & "Reject" buttons only for service providers */}
      {item.status === "Pending" && item.providerId === user.uid && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptBooking(item.id)}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => rejectBooking(item.id)}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Your Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found</Text>}
      />
      <Navbar navigation={navigation} activeTab="Bookings" />
    </View>
  );
};

export default BookingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a90e2",
    marginBottom: 15,
  },
  bookingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  providerText: {
    fontSize: 14,
    color: "#555",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  Pending: {
    color: "orange",
  },
  Confirmed: {
    color: "green",
  },
  Rejected: {
    color: "red",
  },
  Completed: {
    color: "blue",
  },
  cancelButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  acceptButton: {
    backgroundColor: "#34d399",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rejectButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  rejectText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
