// src/lib/firebase/firestore-service.ts
'use server';
import type {
  Client, ClientFormValues, ClientCampaign,
  Campaign, CampaignFormValues,
  Survey, SurveyFormValues, SurveyQuestion,
  BrandProfile,
  RewardProgram,
  RedemptionItem,
  UserPreferences,
  Consumer, ConsumerFormValues,
  TrendData, // Added TrendData
} from '@/types';
import {
  getFirebaseFirestore,
} from '@/lib/firebase/client';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp,
  limit,
  writeBatch,
  getCountFromServer,
  runTransaction,
  setDoc,
} from 'firebase/firestore';

// --- Helper to convert data for Firestore (e.g., Date to Timestamp) ---
const toTimestamp = (date: Date | undefined | null): Timestamp | null => {
  return date ? Timestamp.fromDate(date) : null;
};

const fromTimestampToString = (timestamp: Timestamp | undefined | null): string | undefined => {
  if (!timestamp) return undefined;
  return timestamp.toDate().toISOString();
}

// --- Client Functions ---
export async function addClient(clientData: ClientFormValues): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const docRef = await addDoc(collection(db, 'clients'), {
      ...clientData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      logoUrl: clientData.name ? `https://picsum.photos/seed/${clientData.name.replace(/\s+/g, '')}/64/64` : `https://picsum.photos/64/64`,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding client to Firestore: ", error);
    throw new Error("Failed to create client.");
  }
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'clients', clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        industry: data.industry,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        logoUrl: data.logoUrl,
        status: data.status,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Client;
    }
    return null;
  } catch (error) {
    console.error("Error getting client from Firestore: ", error);
    throw new Error("Failed to fetch client.");
  }
}

export async function getAllClients(): Promise<Client[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'clients'), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        industry: data.industry,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        logoUrl: data.logoUrl,
        status: data.status,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Client;
    });
  } catch (error) {
    console.error("Error getting all clients from Firestore: ", error);
    return [];
  }
}

export async function updateClient(clientId: string, clientData: Partial<ClientFormValues>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'clients', clientId);
    await updateDoc(docRef, {
      ...clientData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating client in Firestore: ", error);
    throw new Error("Failed to update client.");
  }
}

export async function deleteClient(clientId: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const campaignsQuery = query(collection(db, 'campaigns'), where("clientId", "==", clientId));
    const campaignsSnapshot = await getDocs(campaignsQuery);
    
    const batch = writeBatch(db);

    for (const campaignDoc of campaignsSnapshot.docs) {
        const surveysQuery = query(collection(db, 'surveys'), where("campaignId", "==", campaignDoc.id));
        const surveysSnapshot = await getDocs(surveysQuery);
        surveysSnapshot.docs.forEach(surveyDoc => {
            batch.delete(surveyDoc.ref);
        });
        batch.delete(campaignDoc.ref);
    }
    
    const clientDocRef = doc(db, 'clients', clientId);
    batch.delete(clientDocRef);

    await batch.commit();

  } catch (error) {
    console.error("Error deleting client and associated data from Firestore: ", error);
    throw new Error("Failed to delete client.");
  }
}


// --- Campaign Functions ---
export async function addCampaign(campaignData: CampaignFormValues): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const clientDoc = await getDoc(doc(db, 'clients', campaignData.clientId));
    if (!clientDoc.exists()) throw new Error(`Client with ID ${campaignData.clientId} not found.`);
    const clientName = clientDoc.data()?.name || campaignData.clientId;

    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      startDate: toTimestamp(campaignData.startDate),
      endDate: toTimestamp(campaignData.endDate),
      clientName: clientName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding campaign to Firestore: ", error);
    throw new Error("Failed to create campaign.");
  }
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'campaigns', campaignId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        title: data.title,
        clientId: data.clientId,
        clientName: data.clientName,
        productType: data.productType,
        status: data.status,
        startDate: fromTimestampToString(data.startDate as Timestamp),
        endDate: fromTimestampToString(data.endDate as Timestamp),
        targetAudience: data.targetAudience,
        description: data.description,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
       } as Campaign;
    }
    return null;
  } catch (error) {
    console.error("Error getting campaign: ", error);
    throw new Error("Failed to fetch campaign.");
  }
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'campaigns'), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        clientId: data.clientId,
        clientName: data.clientName,
        productType: data.productType,
        status: data.status,
        startDate: fromTimestampToString(data.startDate as Timestamp),
        endDate: fromTimestampToString(data.endDate as Timestamp),
        targetAudience: data.targetAudience,
        description: data.description,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Campaign;
    });
  } catch (error) {
    console.error("Error getting all campaigns: ", error);
    return [];
  }
}

export async function getAllCampaignsForClient(clientId: string): Promise<ClientCampaign[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'campaigns'), where("clientId", "==", clientId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const clientCampaigns: ClientCampaign[] = [];
    for (const docSnap of querySnapshot.docs) {
        const campaignData = docSnap.data();
        const campaignId = docSnap.id;
        const surveysQuery = query(collection(db, 'surveys'), where("campaignId", "==", campaignId));
        const surveysSnapshot = await getCountFromServer(surveysQuery);
        clientCampaigns.push({
            id: campaignId,
            title: campaignData.title,
            surveys: surveysSnapshot.data().count,
        });
    }
    return clientCampaigns;

  } catch (error) {
    console.error("Error getting campaigns for client: ", error);
    return [];
  }
}


export async function updateCampaign(campaignId: string, campaignData: Partial<CampaignFormValues>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const dataToUpdate: Partial<Omit<Campaign, 'id'| 'createdAt' | 'updatedAt' | 'startDate' | 'endDate'> & {startDate?: Timestamp | null, endDate?: Timestamp | null, updatedAt: any}> = { ...campaignData, updatedAt: serverTimestamp() };
    if (campaignData.startDate) {
        dataToUpdate.startDate = toTimestamp(campaignData.startDate);
    }
    if (campaignData.endDate) {
        dataToUpdate.endDate = toTimestamp(campaignData.endDate);
    }
     if(campaignData.clientId) { 
        const clientDoc = await getDoc(doc(db, 'clients', campaignData.clientId));
        if(clientDoc.exists()) dataToUpdate.clientName = clientDoc.data()?.name;
    }

    const docRef = doc(db, 'campaigns', campaignId);
    await updateDoc(docRef, dataToUpdate as any); // Use 'as any' to bypass strict type checking if startDate/endDate are optional in Campaign
  } catch (error) {
    console.error("Error updating campaign: ", error);
    throw new Error("Failed to update campaign.");
  }
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const batch = writeBatch(db);
    const surveysQuery = query(collection(db, 'surveys'), where("campaignId", "==", campaignId));
    const surveysSnapshot = await getDocs(surveysQuery);
    surveysSnapshot.docs.forEach(surveyDoc => {
        batch.delete(surveyDoc.ref);
    });
    const campaignDocRef = doc(db, 'campaigns', campaignId);
    batch.delete(campaignDocRef);
    await batch.commit();
  } catch (error) {
    console.error("Error deleting campaign: ", error);
    throw new Error("Failed to delete campaign.");
  }
}


// --- Survey Functions ---
export async function addSurvey(surveyData: SurveyFormValues): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const campaignDoc = await getDoc(doc(db, 'campaigns', surveyData.campaignId));
    if (!campaignDoc.exists()) throw new Error(`Campaign with ID ${surveyData.campaignId} not found.`);
    const campaignName = campaignDoc.data()?.title || surveyData.campaignId;
    
    let rewardProgramName: string | undefined = undefined;
    if (surveyData.rewardProgramId) {
        const rewardProgramDoc = await getDoc(doc(db, 'rewardPrograms', surveyData.rewardProgramId));
        if (rewardProgramDoc.exists()) {
            rewardProgramName = rewardProgramDoc.data()?.name;
        }
    }

    const docRef = await addDoc(collection(db, 'surveys'), {
      ...surveyData,
      questions: surveyData.questions || [],
      campaignName: campaignName,
      rewardProgramName: rewardProgramName,
      responseCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding survey: ", error);
    throw new Error("Failed to create survey.");
  }
}

export async function getSurveyById(surveyId: string): Promise<Survey | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'surveys', surveyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        name: data.name,
        description: data.description,
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        status: data.status,
        type: data.type,
        rewardProgramId: data.rewardProgramId,
        rewardProgramName: data.rewardProgramName,
        questions: data.questions,
        responseCount: data.responseCount,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
       } as Survey;
    }
    return null;
  } catch (error) {
    console.error("Error getting survey: ", error);
    throw new Error("Failed to fetch survey.");
  }
}

export async function getAllSurveys(filters?: { campaignId?: string }): Promise<Survey[]> {
  const db = getFirebaseFirestore();
  try {
    let q = query(collection(db, 'surveys'), orderBy("createdAt", "desc"));
    if (filters?.campaignId) {
      q = query(q, where("campaignId", "==", filters.campaignId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        campaignId: data.campaignId,
        campaignName: data.campaignName,
        status: data.status,
        type: data.type,
        rewardProgramId: data.rewardProgramId,
        rewardProgramName: data.rewardProgramName,
        questions: data.questions,
        responseCount: data.responseCount,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Survey;
    });
  } catch (error) {
    console.error("Error getting all surveys: ", error);
    return [];
  }
}

export async function updateSurvey(surveyId: string, surveyData: Partial<SurveyFormValues | { questions: SurveyQuestion[], responseCount?: number }>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const dataToUpdate: any = { ...surveyData, updatedAt: serverTimestamp() };
    
    if (surveyData.campaignId) {
        const campaignDoc = await getDoc(doc(db, 'campaigns', surveyData.campaignId));
        if (campaignDoc.exists()) dataToUpdate.campaignName = campaignDoc.data()?.name; // Should be title
    }
    if (surveyData.rewardProgramId !== undefined) { // Check for undefined specifically to allow null
        if (surveyData.rewardProgramId) { // If truthy (not null or empty string)
            const rewardProgramDoc = await getDoc(doc(db, 'rewardPrograms', surveyData.rewardProgramId));
            dataToUpdate.rewardProgramName = rewardProgramDoc.exists() ? rewardProgramDoc.data()?.name : undefined;
        } else { // If null or empty string, set rewardProgramName to null
            dataToUpdate.rewardProgramName = null;
        }
    }


    const docRef = doc(db, 'surveys', surveyId);
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating survey: ", error);
    throw new Error("Failed to update survey.");
  }
}

export async function deleteSurvey(surveyId: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'surveys', surveyId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting survey: ", error);
    throw new Error("Failed to delete survey.");
  }
}

export async function getSurveyCountForCampaign(campaignId: string): Promise<number> {
  const db = getFirebaseFirestore();
    try {
        const q = query(collection(db, 'surveys'), where("campaignId", "==", campaignId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Error getting survey count for campaign:", error);
        return 0;
    }
}


// --- Brand Profile Functions ---
const BRAND_PROFILE_DOC_ID = 'default';

export async function getBrandProfile(): Promise<BrandProfile | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'brandProfile', BRAND_PROFILE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        companyName: data.companyName,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        toneOfVoice: data.toneOfVoice,
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
       } as BrandProfile;
    }
    const defaultProfileData: Omit<BrandProfile, 'id' | 'updatedAt'> = {
        companyName: 'My Company',
        primaryColor: '#003049',
        secondaryColor: '#D6D3D1',
        toneOfVoice: 'Professional and Insightful',
        logoUrl: `https://picsum.photos/seed/defaultbrand/128/128`
    };
    await setDoc(docRef, { ...defaultProfileData, updatedAt: serverTimestamp() });
    return { id: BRAND_PROFILE_DOC_ID, ...defaultProfileData, updatedAt: new Date().toISOString() } as BrandProfile;

  } catch (error) {
    console.error("Error getting brand profile: ", error);
    return null; 
  }
}

export async function updateBrandProfile(data: Partial<Omit<BrandProfile, 'id' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'brandProfile', BRAND_PROFILE_DOC_ID);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("Error updating brand profile: ", error);
    throw new Error("Failed to update brand profile.");
  }
}


// --- Reward Program Functions ---
export async function addRewardProgram(data: Omit<RewardProgram, 'id' | 'createdAt' | 'updatedAt'| 'config'> & { config?: Partial<RewardProgram['config']> }): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const docRef = await addDoc(collection(db, 'rewardPrograms'), {
      ...data,
      config: data.config || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding reward program: ", error);
    throw new Error("Failed to create reward program.");
  }
}

export async function getRewardProgramById(programId: string): Promise<RewardProgram | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'rewardPrograms', programId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        name: data.name,
        type: data.type,
        status: data.status,
        description: data.description,
        config: data.config,
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as RewardProgram;
    }
    return null;
  } catch (error) {
    console.error("Error getting reward program: ", error);
    throw new Error("Failed to fetch reward program.");
  }
}


export async function getAllRewardPrograms(): Promise<RewardProgram[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'rewardPrograms'), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            name: data.name,
            type: data.type,
            status: data.status,
            description: data.description,
            config: data.config,
            createdAt: fromTimestampToString(data.createdAt as Timestamp),
            updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
        } as RewardProgram
    });
  } catch (error) {
    console.error("Error fetching reward programs: ", error);
    return [];
  }
}

export async function updateRewardProgram(id: string, data: Partial<Omit<RewardProgram, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'rewardPrograms', id);
    await updateDoc(docRef, { 
        ...data, 
        config: data.config || {},
        updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error("Error updating reward program: ", error);
    throw new Error("Failed to update reward program.");
  }
}

export async function deleteRewardProgram(id: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const surveysToUpdateQuery = query(collection(db, 'surveys'), where("rewardProgramId", "==", id));
    const surveysSnapshot = await getDocs(surveysToUpdateQuery);
    const batch = writeBatch(db);
    surveysSnapshot.forEach(surveyDoc => {
        batch.update(surveyDoc.ref, { rewardProgramId: null, rewardProgramName: null });
    });
    batch.delete(doc(db, 'rewardPrograms', id));
    await batch.commit();

  } catch (error) {
    console.error("Error deleting reward program: ", error);
    throw new Error("Failed to delete reward program.");
  }
}

// --- Redemption Item Functions ---
export async function addRedemptionItem(data: Omit<RedemptionItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const docRef = await addDoc(collection(db, 'redemptionItems'), {
      ...data,
      stock: data.stock === undefined ? null : data.stock,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding redemption item: ", error);
    throw new Error("Failed to create redemption item.");
  }
}

export async function getAllRedemptionItems(): Promise<RedemptionItem[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'redemptionItems'), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return { 
            id: docSnap.id, 
            name: data.name,
            type: data.type,
            pointsCost: data.pointsCost,
            stock: data.stock,
            isActive: data.isActive,
            imageUrl: data.imageUrl,
            description: data.description,
            createdAt: fromTimestampToString(data.createdAt as Timestamp),
            updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
        } as RedemptionItem
    });
  } catch (error) {
    console.error("Error fetching redemption items: ", error);
    return [];
  }
}

export async function updateRedemptionItem(id: string, data: Partial<Omit<RedemptionItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const updateData: any = { ...data, updatedAt: serverTimestamp() };
    if (data.stock === undefined) {
        updateData.stock = null;
    }
    const docRef = doc(db, 'redemptionItems', id);
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating redemption item: ", error);
    throw new Error("Failed to update redemption item.");
  }
}

export async function deleteRedemptionItem(id: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    await deleteDoc(doc(db, 'redemptionItems', id));
  } catch (error) {
    console.error("Error deleting redemption item: ", error);
    throw new Error("Failed to delete redemption item.");
  }
}

// --- User Preferences ---
const DEFAULT_USER_ID = 'defaultUser'; // This should be dynamic based on actual auth

export async function getUserPreferences(userId: string = DEFAULT_USER_ID): Promise<UserPreferences | null> {
  const db = getFirebaseFirestore();
    try {
        const docRef = doc(db, 'userPreferences', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return { 
                id: docSnap.id, 
                receiveNotifications: data.receiveNotifications,
                theme: data.theme,
                updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
            } as UserPreferences;
        }
        // If no preferences exist, create and return default ones
        const defaultPrefsData: Omit<UserPreferences, 'id' | 'updatedAt'> = {
            receiveNotifications: false,
            theme: 'system',
        };
        await setDoc(docRef, { ...defaultPrefsData, updatedAt: serverTimestamp() });
        return { id: userId, ...defaultPrefsData, updatedAt: new Date().toISOString() } as UserPreferences;

    } catch (error) {
        console.error("Error getting user preferences:", error);
        return null; 
    }
}

export async function updateUserPreferences(userId: string = DEFAULT_USER_ID, data: Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
    try {
        const docRef = doc(db, 'userPreferences', userId);
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
        console.error("Error updating user preferences:", error);
        throw new Error("Failed to update user preferences.");
    }
}


// --- Consumer Functions ---
export async function addConsumer(consumerData: ConsumerFormValues): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const docRef = await addDoc(collection(db, 'consumers'), {
      ...consumerData,
      avatarUrl: `https://picsum.photos/seed/${consumerData.email.split('@')[0]}/64/64`, // Generate a consistent avatar
      surveysTaken: 0,
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding consumer to Firestore: ", error);
    throw new Error("Failed to create consumer profile.");
  }
}

export async function getConsumerById(consumerId: string): Promise<Consumer | null> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'consumers', consumerId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        segment: data.segment,
        notes: data.notes,
        surveysTaken: data.surveysTaken,
        lastActive: fromTimestampToString(data.lastActive as Timestamp),
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Consumer;
    }
    return null;
  } catch (error) {
    console.error("Error getting consumer from Firestore: ", error);
    throw new Error("Failed to fetch consumer profile.");
  }
}

export async function getAllConsumers(): Promise<Consumer[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, 'consumers'), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        segment: data.segment,
        notes: data.notes,
        surveysTaken: data.surveysTaken,
        lastActive: fromTimestampToString(data.lastActive as Timestamp),
        createdAt: fromTimestampToString(data.createdAt as Timestamp),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
      } as Consumer;
    });
  } catch (error) {
    console.error("Error getting all consumers from Firestore: ", error);
    return [];
  }
}

export async function updateConsumer(consumerId: string, consumerData: Partial<ConsumerFormValues>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'consumers', consumerId);
    await updateDoc(docRef, {
      ...consumerData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating consumer in Firestore: ", error);
    throw new Error("Failed to update consumer profile.");
  }
}

export async function deleteConsumer(consumerId: string): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    // Note: Consider implications of deleting a consumer, e.g., anonymizing their responses instead of hard delete.
    // For this example, we'll do a hard delete.
    const docRef = doc(db, 'consumers', consumerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting consumer from Firestore: ", error);
    throw new Error("Failed to delete consumer profile.");
  }
}


// --- Dashboard KPI Data ---
export async function getKpiData() {
  const db = getFirebaseFirestore();
  try {
    const clientsSnapshot = await getCountFromServer(collection(db, 'clients'));
    const campaignsSnapshot = await getCountFromServer(collection(db, 'campaigns'));
    const surveysSnapshot = await getCountFromServer(collection(db, 'surveys'));
    
    let totalRespondents = 0;
    const allSurveysSnap = await getDocs(query(collection(db, 'surveys')));
    allSurveysSnap.forEach(surveyDoc => {
        totalRespondents += (surveyDoc.data().responseCount || 0) as number;
    });


    return {
        totalClients: clientsSnapshot.data().count,
        totalCampaigns: campaignsSnapshot.data().count,
        totalSurveys: surveysSnapshot.data().count,
        totalRespondents: totalRespondents,
    };
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    return {
        totalClients: 0,
        totalCampaigns: 0,
        totalSurveys: 0,
        totalRespondents: 0,
    };
  }
}


export async function getRecentCampaigns(count: number = 4): Promise<Campaign[]> {
  const db = getFirebaseFirestore();
    try {
        const q = query(collection(db, 'campaigns'), orderBy("createdAt", "desc"), limit(count));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data.title,
                clientId: data.clientId,
                clientName: data.clientName,
                productType: data.productType,
                status: data.status,
                startDate: fromTimestampToString(data.startDate as Timestamp),
                endDate: fromTimestampToString(data.endDate as Timestamp),
                targetAudience: data.targetAudience,
                description: data.description,
                createdAt: fromTimestampToString(data.createdAt as Timestamp),
                updatedAt: fromTimestampToString(data.updatedAt as Timestamp),
            } as Campaign;
        });
    } catch (error) {
        console.error("Error getting recent campaigns: ", error);
        return [];
    }
}


// --- Mock Data for Charts -> To be replaced with dynamic data from Firestore later ---
// These are now async to align with Server Action expectations
export async function getResponseRateData(): Promise<Array<{name: string, sent: number, responses: number}>> {
 return [
  { name: 'Survey Alpha', sent: 450, responses: 280 },
  { name: 'Survey Beta', sent: 320, responses: 150 },
  { name: 'Survey Gamma', sent: 210, responses: 180 },
  { name: 'Survey Delta', sent: 290, responses: 190 },
  { name: 'Survey Epsilon', sent: 190, responses: 120 },
];
}
export async function getRatingData(): Promise<Array<{name: string, value: number}>> {
 return [
  { name: '1 Star', value: 8 },
  { name: '2 Stars', value: 12 },
  { name: '3 Stars', value: 35 },
  { name: '4 Stars', value: 30 },
  { name: '5 Stars', value: 15 },
];
}

export async function getCompletionTrendData(): Promise<Array<{name: string, completions: number, dropOffs: number}>> {
 return [
  { name: 'Jan', completions: 35, dropOffs: 6 },
  { name: 'Feb', completions: 50, dropOffs: 9 },
  { name: 'Mar', completions: 65, dropOffs: 11 },
  { name: 'Apr', completions: 50, dropOffs: 14 },
  { name: 'May', completions: 75, dropOffs: 16 },
  { name: 'Jun', completions: 90, dropOffs: 20 },
];
}


// These are now async to align with Server Action expectations
export async function getMockReportTypes(): Promise<Array<{id: string, name: string}>> {
 return [
  { id: 'summary', name: 'Summary Report' },
  { id: 'cross_tab', name: 'Cross-Tabulation' },
  { id: 'demographics', name: 'Demographic Breakdown' },
  { id: 'sentiment', name: 'Sentiment Analysis (AI)' },
];
}

export async function getRecentRedemptions(): Promise<Array<{id: string, userId: string, userName: string, reward: string, pointsCost: number, date: string}>> {
    return [
        { id: 'red_alpha', userId: 'user_123', userName: 'Alice Wonderland', reward: '$10 Amazon Card', pointsCost: 100, date: '2024-05-01' },
        { id: 'red_beta', userId: 'user_456', userName: 'Bob The Builder', reward: '20% Off Coupon - SnackCo', pointsCost: 50, date: '2024-04-28' },
    ];
}

// --- Mock Data for Trends Page ---
export async function getMockTrendData(): Promise<TrendData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    productMentions: [
      { date: '2024-01', value: 120 },
      { date: '2024-02', value: 150 },
      { date: '2024-03', value: 130 },
      { date: '2024-04', value: 180 },
      { date: '2024-05', value: 210 },
    ],
    flavorPreferences: [
      { name: 'Spicy Mango', value: 450 },
      { name: 'Sweet Chili', value: 300 },
      { name: 'Garlic Parmesan', value: 250 },
      { name: 'Classic BBQ', value: 180 },
      { name: 'Honey Mustard', value: 120 },
    ],
    sentimentOverTime: [
      { date: '2024-01', value: 65 }, // Average sentiment score (e.g., 0-100)
      { date: '2024-02', value: 70 },
      { date: '2024-03', value: 68 },
      { date: '2024-04', value: 75 },
      { date: '2024-05', value: 72 },
    ],
  };
}
