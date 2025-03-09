import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Import Firestore instance

const ServiceDetails = ({ route, navigation }) => {
  const { service } = route.params;
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("serviceId", "==", service.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsList = snapshot.docs.map((doc) => doc.data());
      setReviews(reviewsList);
    });
    return () => unsubscribe();
  }, [service.id]);

  const handleMessage = () => {
    if (!service.userId) {
      Alert.alert("Error", "The service provider's information is missing.");
      return;
    }
    navigation.navigate("ChatScreen", {
      recipientId: service.userId,
      recipientName: service.serviceName,
    });
  };

  const handleBook = () => {
    if (!service) {
      Alert.alert("Error", "Service details are missing.");
      return;
    }
    if (!date) {
      Alert.alert("Error", "Please select a date and time.");
      return;
    }
    // Pass service details along with selected date & time
    navigation.navigate("Bookings", { service, selectedDate: date });
  };

  // Handle Date Picker change
  const onChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Service Banner */}
      <Image
        source={{
          uri: service.image || "https://norakramerdesigns.b-cdn.net/wp-content/uploads/2022/05/home_remodeling_website_design.jpg",
        }}
        style={styles.bannerImage}
      />

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>
          {service.serviceName || "Service Name Unavailable"}
        </Text>
        <Text style={styles.category}>
          <Icon name="pricetag-outline" size={18} color="#4a90e2" />{" "}
          {service.category || "Category Unavailable"}
        </Text>
        <Text style={styles.description}>
          {service.description || "No description provided for this service."}
        </Text>
        <Text style={styles.price}>
          <Icon name="cash-outline" size={18} color="#4a90e2" /> Price Range:{" "}
          {service.priceRange || "Not Specified"}
        </Text>
        <Text style={styles.availability}>
          <Icon name="calendar-outline" size={18} color="#4a90e2" />{" "}
          Availability: {service.availability || "Not Specified"}
        </Text>
      </View>

      {/* Date & Time Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateText}>
          Selected Time: {date.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Icon name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Select Date & Time</Text>
        </TouchableOpacity>
      </View>

      {/* Show DateTimePicker for iOS or Android */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}

      {/* Reviews */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.reviewsTitle}>Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewRating}>Rating: {review.rating}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewsText}>No reviews yet.</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => navigation.navigate("SubmitReview", { serviceId: service.id })}
      >
        <Text style={styles.reviewButtonText}>Submit a Review</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Icon name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Icon name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ServiceDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  bannerImage: {
    width: "100%",
    height: 220,
    marginBottom: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  datePickerContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "45%",
    justifyContent: "center",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34d399",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: "45%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  reviewsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
  },
  reviewRating: {
    fontSize: 14,
    color: "#4a90e2",
  },
  noReviewsText: {
    fontSize: 14,
    color: "#999",
  },
  reviewButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
