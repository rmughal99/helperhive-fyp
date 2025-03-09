import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/Ionicons";

const SubmitReview = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const submitReview = async () => {
    if (rating === 0 || reviewText.trim() === "") {
      Alert.alert("Error", "Please provide a rating and review text.");
      return;
    }

    try {
      await addDoc(collection(db, "reviews"), {
        serviceId,
        userId: auth.currentUser.uid,
        rating,
        text: reviewText.trim(),
        timestamp: new Date(),
      });
      Alert.alert("Success", "Your review has been submitted!");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#005bea" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Submit a Review</Text>
        <TextInput
          placeholder="Write your review here..."
          placeholderTextColor="#aaa"
          style={styles.input}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
        />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>Rating:</Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Icon
                name={star <= rating ? "star" : "star-outline"}
                size={30}
                color="#ffd700"
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#005bea",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#e6e9ee",
    color: "#333",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    height: 150,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 18,
    color: "#333",
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SubmitReview;
