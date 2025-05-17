
'use server';
import { db } from '@/lib/firebase';
import type { Meeting } from '@/types/meeting';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const meetingsCollection = collection(db, 'meetings');

export async function createMeeting(
  userId: string,
  meetingData: Omit<Meeting, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isShared'> & { title: string }
): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to create a meeting.');
  }
  if (!meetingData.title || meetingData.title.trim() === "") {
    throw new Error('Meeting title is required.');
  }
  try {
    const docRef = await addDoc(meetingsCollection, {
      ...meetingData,
      userId,
      isShared: false, // Default to not shared
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating meeting in Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create meeting: ${error.message}`);
    }
    throw new Error('Failed to create meeting due to an unknown error.');
  }
}

export async function updateMeetingTitle(
  meetingId: string,
  newTitle: string
): Promise<void> {
  if (!meetingId) {
    throw new Error('Meeting ID is required to update the title.');
  }
  if (!newTitle || newTitle.trim() === "") {
    throw new Error('New meeting title cannot be empty.');
  }
  try {
    const docRef = doc(db, 'meetings', meetingId);
    await updateDoc(docRef, {
      title: newTitle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating meeting title in Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update meeting title: ${error.message}`);
    }
    throw new Error('Failed to update meeting title due to an unknown error.');
  }
}

export async function updateMeetingSharingStatus(
  meetingId: string,
  userId: string, // For ownership verification
  isShared: boolean
): Promise<void> {
  if (!meetingId) {
    throw new Error('Meeting ID is required to update sharing status.');
  }
  if (!userId) {
    throw new Error('User ID is required for verification.');
  }
  try {
    const docRef = doc(db, 'meetings', meetingId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Meeting not found.');
    }
    if (docSnap.data()?.userId !== userId) {
      throw new Error('User not authorized to change sharing status for this meeting.');
    }

    await updateDoc(docRef, {
      isShared: isShared,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating meeting sharing status in Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update sharing status: ${error.message}`);
    }
    throw new Error('Failed to update sharing status due to an unknown error.');
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  if (!meetingId) {
    throw new Error('Meeting ID is required to delete a meeting.');
  }
  try {
    const docRef = doc(db, 'meetings', meetingId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting meeting from Firestore:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete meeting: ${error.message}`);
    }
    throw new Error('Failed to delete meeting due to an unknown error.');
  }
}

export async function getMeetingsForUser(userId: string): Promise<Meeting[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch meetings.');
  }
  try {
    const q = query(
      meetingsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Meeting)
    );
  } catch (error) {
    console.error('Error fetching meetings for user:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }
    throw new Error('Failed to fetch meetings due to an unknown error.');
  }
}

export async function getMeetingById(meetingId: string): Promise<Meeting | null> {
  if (!meetingId) {
    throw new Error('Meeting ID is required to fetch a meeting.');
  }
  try {
    const docRef = doc(db, 'meetings', meetingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Meeting;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching meeting by ID:', error);
     if (error instanceof Error) {
      throw new Error(`Failed to fetch meeting: ${error.message}`);
    }
    throw new Error('Failed to fetch meeting due to an unknown error.');
  }
}


export async function getPublicMeetingById(meetingId: string): Promise<Meeting | null> {
  if (!meetingId) {
    throw new Error('Meeting ID is required to fetch a shared meeting.');
  }
  try {
    const docRef = doc(db, 'meetings', meetingId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const meetingData = docSnap.data() as Meeting;
      if (meetingData.isShared) {
        return { id: docSnap.id, ...meetingData };
      }
      // If not shared, return null or throw an error indicating it's not shared
      console.log(`Meeting ${meetingId} found but is not marked as shared.`);
      return null; 
    } else {
      console.log(`Meeting ${meetingId} not found.`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching public meeting by ID:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch shared meeting: ${error.message}`);
    }
    throw new Error('Failed to fetch shared meeting due to an unknown error.');
  }
}
