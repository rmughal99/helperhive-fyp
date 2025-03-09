import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Navbar from "./navbar";
import { auth, db } from "../firebase";
import { UserContext } from "../context/UserContext";
import { doc, getDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

const ProfilePage = ({ navigation }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [isServiceProvider, setIsServiceProvider] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        if (auth.currentUser) {
          try {
            console.log("Fetching data for UID:", auth.currentUser.uid);
            const userRef = doc(db, "users", auth.currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userInfo = userDoc.data();
              console.log("User data from Firestore:", userInfo);
              
              setUserData(userInfo);
              setUser((prev) => ({ ...prev, ...userInfo }));

              // Ensure isServiceProvider is correctly fetched
              setIsServiceProvider(!!userInfo.isServiceProvider);
            } else {
              console.log("No user data found in Firestore.");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          } finally {
            setLoading(false);
          }
        }
      };

      fetchUserData();
    }, [])
  );

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate("SignIn");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#005bea" barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Icon name="logo-laravel" size={30} color="#4a90e2" />
            <Text style={styles.headerTitle}>Profile</Text>
            <Icon name="ellipsis-horizontal-outline" size={24} color="#fff" />
          </View>

          <View style={styles.profileContainer}>
            <View>
              <Image
                source={{
                  uri: userData?.profileImage || "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("FillProfile")}
              >
                <Icon name="pencil-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>
              {userData?.name || "Guest User"}
            </Text>
            <Text style={styles.profileEmail}>
              {userData?.email || "No email available"}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* Only show "Become a Service Provider" if user is NOT a service provider */}
            {!isServiceProvider && userData?.requestStatus !== "Pending" && (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => navigation.navigate("FillProfile")}
              >
                <View style={styles.optionLeft}>
                  <Icon name="briefcase-outline" size={24} color="#4a90e2" />
                  <Text style={styles.optionText}>Become a Service Provider</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#4a90e2" />
              </TouchableOpacity>
            )}

            {/* Show request status if pending */}
            {userData?.requestStatus === "Pending" && (
              <View style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Icon name="time-outline" size={24} color="#4a90e2" />
                  <Text style={styles.optionText}>Request Pending</Text>
                </View>
              </View>
            )}

            {/* Only show "Upload Your Service" if user IS a service provider */}
            {isServiceProvider && (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() =>
                  navigation.navigate("ServiceProviderRegistration")
                }
              >
                <View style={styles.optionLeft}>
                  <Icon name="cloud-upload-outline" size={24} color="#4a90e2" />
                  <Text style={styles.optionText}>Upload Your Service</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#4a90e2" />
              </TouchableOpacity>
            )}

            {/* Only show "Admin Dashboard" if user is an admin */}
            {user?.isAdmin && (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => navigation.navigate("AdminDashboard")}
              >
                <View style={styles.optionLeft}>
                  <Icon name="settings-outline" size={24} color="#4a90e2" />
                  <Text style={styles.optionText}>Admin Dashboard</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#4a90e2" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Icon name="settings-outline" size={24} color="#4a90e2" />
                <Text style={styles.optionText}>Language</Text>
              </View>
              <Text style={styles.languageText}>English (US)</Text>
            </TouchableOpacity>

            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Icon name="moon-outline" size={24} color="#4a90e2" />
                <Text style={styles.optionText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(value) => setDarkMode(value)}
                thumbColor={darkMode ? "#4a90e2" : "#fff"}
                trackColor={{ false: "#ccc", true: "#4a90e2" }}
              />
            </View>

            {[{ name: "Privacy Policy", icon: "lock-closed-outline" },
              { name: "Help Center", icon: "information-circle-outline" },
              { name: "Invite Friends", icon: "people-outline" }].map((option, index) => (
              <TouchableOpacity key={index} style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  <Icon name={option.icon} size={24} color="#4a90e2" />
                  <Text style={styles.optionText}>{option.name}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#4a90e2" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <View style={styles.optionLeft}>
                <Icon name="log-out-outline" size={24} color="#f87171" />
                <Text style={[styles.optionText, { color: "#f87171" }]}>
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Navbar navigation={navigation} activeTab="Profile" />
      </View>
    </SafeAreaView>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#005bea",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#005bea",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: "#4a90e2",
    fontWeight: "bold",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ccc",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4a90e2",
    borderRadius: 15,
    padding: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#555",
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 15,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  languageText: {
    fontSize: 16,
    color: "#555",
  },
});
