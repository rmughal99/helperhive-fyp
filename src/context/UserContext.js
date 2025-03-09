import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { firestore } from '../firebase'; // Import Firestore
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await firestore.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            const reviewsRef = collection(firestore, "reviews");
            const q = query(reviewsRef, where("userId", "==", user.uid));
            const unsubscribeReviews = onSnapshot(q, (snapshot) => {
              const reviews = snapshot.docs.map((doc) => doc.data());
              setUser({ ...userData, reviews, isAdmin: userData.isAdmin });
            });
            return () => unsubscribeReviews();
          } else {
            setUser(null);
          }
        } catch (error) {
          console.log(error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};