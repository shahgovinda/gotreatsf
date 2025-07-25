import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuthStore } from "../store/authStore";
import { signOut } from "firebase/auth";
import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebaseConfig'
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserDetails } from '../store/authStore';
import toast from 'react-hot-toast';

const BASE_URL = 'https://us-central1-chanda-home-essentials.cloudfunctions.net';// Replace with your actual base URL

export interface AddressDetails {
    flatNumber: string;
    buildingName: string;
    streetAddress: string;
    landmark: string;
    area: string;
    pincode: string;
    formattedAddress: string;
}

export const handleEmailAccountCreation = async (
    name: string,
    email: string,
    password: string,
    phoneNumber: string,
    // address: string
    ) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential?.user;
        await setDoc(doc(db, "users", newUser.uid), {
            displayName: name,
            email: newUser.email,
            uid: newUser.uid,
            phoneNumber: phoneNumber,
            photoURL: newUser.photoURL,
            address: null,
            role:'customer',
            profileImage: newUser.photoURL || '',
        });
        const userDetails = await getUserFromDb(newUser.uid);
        useAuthStore.getState().setUserDetails(userDetails);
        toast.success(`Account created! Welcome, ${name || 'there'}!`);
        console.log("Account created successfully with email");
    } catch (err) {
        throw err
    }
}


export const handleEmailAccountLogin = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDetails = await getUserFromDb(result.user.uid);
        useAuthStore.getState().setUserDetails(userDetails);
        toast.success(`Welcome back, ${userDetails?.displayName || 'there'}!`);
    } catch (err) {
        throw (err instanceof Error ? err : new Error('Failed to sign in with email'));
    }
}

export const handlesignInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getUserFromDb(user.uid);

        if (!userDoc) {
            // First time sign in - create user document
            const newUserDetails = {
                displayName: user.displayName,
                email: user.email,
                phoneNumber: null,
                photoURL: user.photoURL,
                uid: user.uid,
                address: null,
                role: 'customer',
                profileImage: user.photoURL || '',
            };
            await setDoc(doc(db, "users", user.uid), newUserDetails);

            // Update the auth store with the new user's details
            useAuthStore.getState().setUserDetails(newUserDetails);
            toast.success(`Account created! Welcome, ${user.displayName || 'there'}!`);
        } else {
            // Returning user - update the auth store with existing document
            useAuthStore.getState().setUserDetails(userDoc);
            toast.success(`Welcome back, ${userDoc.displayName || 'there'}!`);
        }

        // Update the auth store with the user object
        useAuthStore.getState().setUser(user);

    } catch (err) {
        throw err;
    }
}

export function mapToUserDetails(data: any, uid: string): UserDetails {
  return {
    uid,
    email: data.email || '',
    displayName: data.displayName || '',
    phoneNumber: data.phoneNumber || '',
    address: data.address || '',
    profileImage: data.profileImage || '',
  };
}

export const getUserFromDb = async (uid: string): Promise<UserDetails | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return mapToUserDetails(userSnap.data(), uid);
  }
  return null;
};

export async function getAllCustomersFromDb() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        // Return an array of user data with their document IDs
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.log(e);
    }
}

// Update user address in Firestore
export const updateUserAddress = async (uid: string, address) => {
    try {
        const updateData = { address }; // Store only the address object
        await setDoc(doc(db, "users", uid), updateData, { merge: true });

        // Optionally fetch updated user details
        const updatedUserDetails = await getUserFromDb(uid);
        useAuthStore.getState().setUserDetails(updatedUserDetails);
        return updatedUserDetails;
    } catch (err) {
        console.error("Error updating address:", err);
        throw err;
    }
};

export const updateUserPhone = async (uid: string, phoneNumber: string) => {
    try {
        await setDoc(doc(db, "users", uid), {
            phoneNumber: phoneNumber
        }, { merge: true });
        
        const updatedUserDetails = await getUserFromDb(uid);
        useAuthStore.getState().setUserDetails(updatedUserDetails);
        return updatedUserDetails;
    } catch (err) {
        throw err;
    }
}

export const updateUserPhoneNumber = async (uid: string, phoneNumber: string) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            phoneNumber: phoneNumber
        });
        return true;
    } catch (error) {
        console.error('Error updating phone number:', error);
        throw error;
    }
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
    } catch (err) {
        throw err;
    }
}



export const validateAdminPassword = async (password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${BASE_URL}/validateAdminPassword`, { password });
      return response.data.success;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  };

  export const saveNewUserToFirestore = async (userData: any) => {
  const ref = doc(db, "users", userData.uid);
  await setDoc(ref, userData);
};

  // httpsCallable was not working for some reason it remains unauthorized so using https api method
// export const validateAdminPassword = async (password: string): Promise<boolean> => {
//     try {
//         const currentUser = auth.currentUser;
//         console.log('Current user:', currentUser); // Log the current user
        
//         if (!currentUser) {
//             throw new Error("User is not authenticated. Please sign in first.");
//         }
//         await currentUser.getIdToken(true);
//         console.log('Sending password:', password); 
//         const validatePassword = httpsCallable(functions, 'validateAdminPassword');
//         const response = await validatePassword({ password });
//         return response.data.success;
//     } catch (error: any) {
//         console.error('Error validating password:', error.message);
//         return false;
//     }
// };

export const updateUserProfile = async (uid: string, updates: any) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
};

export const uploadProfileImage = async (uid: string, file: File) => {
    try {
        // Create a storage reference
        const storageRef = ref(storage, `profile_images/${uid}`);
        
        // Upload the file
        await uploadBytes(storageRef, file);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update user profile with new image URL
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            profileImage: downloadURL
        });
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
};

export const deleteProfileImage = async (uid: string) => {
  try {
    // Get the current user document
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;
    const data = userSnap.data();
    const imageUrl = data.profileImage;
    if (!imageUrl) return false;

    // Delete from Firebase Storage
    // Extract the path from the URL
    const matches = imageUrl.match(/profile_images%2F([^?]+)/);
    if (matches && matches[1]) {
      const imagePath = decodeURIComponent('profile_images/' + matches[1]);
      const imageRef = ref(storage, imagePath);
      const { deleteObject } = await import('firebase/storage');
      await deleteObject(imageRef);
    }

    // Remove profileImage field from Firestore
    await updateDoc(userRef, { profileImage: '' });
    return true;
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return false;
  }
};


