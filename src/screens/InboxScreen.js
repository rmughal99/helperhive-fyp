import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore";
import Navbar from "./navbar";

const InboxScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const messagesRef = collection(db, "messages");
      const q = query(
        messagesRef,
        where("participants", "array-contains", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data());
        const groupedConversations = {};
        const userInfoCache = {};

        for (const msg of messages) {
          const otherUserId =
            msg.senderId === auth.currentUser?.uid
              ? msg.recipientId
              : msg.senderId;

          if (!groupedConversations[otherUserId]) {
            if (!userInfoCache[otherUserId]) {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userInfoCache[otherUserId] = {
                  name: userData.name || "User",
                  image: userData.image || null,
                  isOnline: userData.isOnline || false,
                  lastSeen: userData.lastSeen || null,
                };
              } else {
                userInfoCache[otherUserId] = {
                  name: "User",
                  image: null,
                  isOnline: false,
                  lastSeen: null,
                };
              }
            }

            groupedConversations[otherUserId] = {
              ...msg,
              id: otherUserId,
              name: userInfoCache[otherUserId].name,
              image: userInfoCache[otherUserId].image,
              isOnline: userInfoCache[otherUserId].isOnline,
              lastSeen: userInfoCache[otherUserId].lastSeen,
            };
          }
        }

        setConversations(Object.values(groupedConversations));
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchConversations();
  }, []);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          recipientId: item.id,
          recipientName: item.name,
        })
      }
    >
      <View>
        <Image
          source={{
            uri: item.image || "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
          }}
          style={styles.chatImage}
        />
        {item.isOnline ? (
          <View style={styles.onlineIndicator} />
        ) : null}
      </View>

      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        {item.isOnline ? (
          <Text style={styles.onlineText}>Online</Text>
        ) : item.lastSeen ? (
          <Text style={styles.lastSeenText}>
            Last seen: {new Date(item.lastSeen.toDate()).toLocaleString()}
          </Text>
        ) : null}
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.chatTime}>
        {new Date(item.timestamp?.seconds * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#005bea" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No chats available</Text>
          }
        />
      </View>
      <Navbar navigation={navigation} activeTab="Inbox" />
    </SafeAreaView>
  );
};

export default InboxScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#005bea",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a90e2",
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chatImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chatMessage: {
    fontSize: 14,
    color: "#555",
  },
  chatTime: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0f0",
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineText: {
    color: "#0f0",
    fontSize: 14,
  },
  lastSeenText: {
    color: "#999",
    fontSize: 12,
  },
});
