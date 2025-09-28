import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  auth,
  db,
  storage,
  functions
} from "../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthStore, UserDetails } from "../store/authStore";
import axios from "axios";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import toast from "react-hot-toast";

const BASE_URL =
  "https://us-central1-chanda-home-essentials.cloudfunctions.net";

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
  phoneNumber: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const newUser = userCredential.user;

    const userDetails: UserDetails = {
      uid: newUser.uid,
      email: newUser.email || "",
      displayName: name,
      phoneNumber: phoneNumber,
      address: null,
      profileImage: newUser.photoURL || "",
      role: "customer",
    };

    await setDoc(doc(db, "users", newUser.uid), userDetails);
    useAuthStore.getState().setUserDetails(userDetails);
    toast.success(`Account created! Welcome, ${name || "there"}!`);
  } catch (err) {
    throw err;
  }
};

export const handleEmailAccountLogin = async (
  email: string,
  password: string
) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const userDetails = await getUserFromDb(result.user.uid);
    if (userDetails) {
      useAuthStore.getState().setUserDetails(userDetails);
      toast.success(`Welcome back, ${userDetails.displayName || "there"}!`);
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error("Login failed");
  }
};

export const handlesignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const existingUser = await getUserFromDb(user.uid);

    if (!existingUser) {
      const newUserDetails: UserDetails = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        address: null,
        profileImage: user.photoURL || "",
        role: "customer",
      };

      await setDoc(doc(db, "users", user.uid), newUserDetails);
      useAuthStore.getState().setUserDetails(newUserDetails);
      toast.success(`Account created! Welcome, ${user.displayName || "there"}!`);
    } else {
      useAuthStore.getState().setUserDetails(existingUser);
      toast.success(`Welcome back, ${existingUser.displayName || "there"}!`);
    }

    useAuthStore.getState().setUser(user);
  } catch (err) {
    throw err;
  }
};

export const getUserFromDb = async (
  uid: string
): Promise<UserDetails | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserDetails;
  }
  return null;
};

export async function getAllCustomersFromDb() {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export const updateUserAddress = async (uid: string, address: any) => {
  try {
    await setDoc(doc(db, "users", uid), { address }, { merge: true });
    const updated = await getUserFromDb(uid);
    useAuthStore.getState().setUserDetails(updated);
    return updated;
  } catch (err) {
    console.error("Error updating address:", err);
    throw err;
  }
};

export const updateUserPhone = async (uid: string, phoneNumber: string) => {
  try {
    await setDoc(doc(db, "users", uid), { phoneNumber }, { merge: true });
    const updated = await getUserFromDb(uid);
    useAuthStore.getState().setUserDetails(updated);
    return updated;
  } catch (err) {
    throw err;
  }
};

export const updateUserPhoneNumber = async (
  uid: string,
  phoneNumber: string
) => {
  try {
    await updateDoc(doc(db, "users", uid), { phoneNumber });
    return true;
  } catch (error) {
    console.error("Error updating phone number:", error);
    throw error;
  }
};

export const handleLogout = async () => {
  try {
    await signOut(auth);
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setUserDetails(null);
  } catch (err) {
    throw err;
  }
};

export const validateAdminPassword = async (
  password: string
): Promise<boolean> => {
  try {
    const response = await axios.post(`${BASE_URL}/validateAdminPassword`, {
      password,
    });
    return response.data.success;
  } catch (error) {
    console.error("Error validating password:", error);
    return false;
  }
};

export const saveNewUserToFirestore = async (userData: UserDetails) => {
  await setDoc(doc(db, "users", userData.uid), userData);
};

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserDetails>
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
};

export const uploadProfileImage = async (
  uid: string,
  file: File
): Promise<string> => {
  try {
    const storageRef = ref(storage, `profile_images/${uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", uid), { profileImage: downloadURL });
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const deleteProfileImage = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;

    const imageUrl = userSnap.data().profileImage;
    if (!imageUrl) return false;

    const matches = imageUrl.match(/profile_images%2F([^?]+)/);
    if (matches?.[1]) {
      const imagePath = decodeURIComponent(`profile_images/${matches[1]}`);
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    }

    await updateDoc(userRef, { profileImage: "" });
    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return false;
  }
};
