// src/lib/firebase/firestore-service.ts
'use server';
import type {
  Client, ClientFormValues, ClientCampaign,
  Campaign, CampaignFormValues,
  Survey, SurveyFormValues, SurveyQuestion, SurveyQuestionOption,
  BrandProfile,
  RewardProgram,
  RedemptionItem,
  UserPreferences,
  Consumer, ConsumerFormValues,
  TrendData, TimeSeriesDataPoint, CategoricalDataPoint,
  KPIData,
  SurveyResponse,
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

// Helper to convert Firestore Timestamp or Date object to ISO string date
const fromTimestampToString = (timestamp: Timestamp | Date | string | undefined | null): string | undefined => {
  if (!timestamp) return undefined;
  if (typeof timestamp === 'string') {
    // Check if it's already an ISO string
    if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp)) {
        return timestamp;
    }
    // If it's a string but not ISO, try parsing (might be risky if format varies)
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    console.warn("Unrecognized string timestamp format, returning as is:", timestamp);
    return timestamp; // return original string if parsing fails
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  console.warn("Unexpected timestamp format, unable to convert to string:", timestamp);
  return undefined;
};


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
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        startDate: fromTimestampToString(data.startDate as Timestamp | Date),
        endDate: fromTimestampToString(data.endDate as Timestamp | Date),
        targetAudience: data.targetAudience,
        description: data.description,
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        startDate: fromTimestampToString(data.startDate as Timestamp | Date),
        endDate: fromTimestampToString(data.endDate as Timestamp | Date),
        targetAudience: data.targetAudience,
        description: data.description,
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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

  } catch (error: any) {
    console.error("Error getting campaigns for client: ", error.message);
    if (error.code === 'failed-precondition') {
        const indexCreationLink = `https://console.firebase.google.com/v1/r/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClRwcm9qZWN0cy9pbnNpZ2h0cHVsc2UtNjIyZTAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NhbXBhaWducy9pbmRleGVzL18QARoMCghjbGllbnRJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI`;
        console.error(`Firestore index missing for 'campaigns' collection, when querying by 'clientId' and ordering by 'createdAt'. Please create the required composite index in your Firebase console: ${indexCreationLink}`);
        throw new Error(`Database query failed: missing index for campaigns (clientId, createdAt). Please create it here: ${indexCreationLink}`);
    }
    throw error;
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
          if(clientDoc.exists()) {
              dataToUpdate.clientName = clientDoc.data()?.name;
          } else {
              console.warn(`Client with ID ${campaignData.clientId} not found when updating campaign. clientName might be stale.`);
              dataToUpdate.clientName = campaignData.clientId;
          }
      }

      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, dataToUpdate as any);
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
    if (!surveyData.campaignId) {
        console.error("addSurvey: campaignId is missing in surveyData", surveyData);
        throw new Error("Campaign ID is required to create a survey.");
    }

    const campaignDocRef = doc(db, 'campaigns', surveyData.campaignId);
    const campaignDoc = await getDoc(campaignDocRef);

    if (!campaignDoc.exists()) {
        console.error(`addSurvey: Campaign with ID ${surveyData.campaignId} not found.`);
        throw new Error(`Campaign with ID ${surveyData.campaignId} not found. Cannot create survey.`);
    }
    const campaignName = campaignDoc.data()?.title || surveyData.campaignId;

    let rewardProgramName: string | undefined = undefined;
    if (surveyData.rewardProgramId) {
        const rewardProgramDocRef = doc(db, 'rewardPrograms', surveyData.rewardProgramId);
        const rewardProgramDoc = await getDoc(rewardProgramDocRef);
        if (rewardProgramDoc.exists()) {
            rewardProgramName = rewardProgramDoc.data()?.name;
        } else {
            console.warn(`addSurvey: Reward program with ID ${surveyData.rewardProgramId} not found, but proceeding without it.`);
        }
    }
    
    const questionsToSave: SurveyQuestion[] = (surveyData.questions || []).map(q => ({
        ...q,
        options: q.options ? q.options.map(opt => ({ value: typeof opt === 'string' ? opt : opt.value } as SurveyQuestionOption)) : []
    }));


    const dataToSave = {
      ...surveyData,
      questions: questionsToSave,
      campaignName: campaignName,
      rewardProgramId: surveyData.rewardProgramId || null,
      rewardProgramName: rewardProgramName,
      responseCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'surveys'), dataToSave);
    return docRef.id;
  } catch (error: any) {
    console.error("Error adding survey to Firestore. Details:", error);
    console.error("Survey Data causing error:", surveyData);

    let errorMessage = "Failed to create survey.";
    if (error.message && error.message.includes("Campaign with ID")) {
        errorMessage = error.message;
    } else if (error.code === 'permission-denied' || (error.message && error.message.includes('PERMISSION_DENIED'))) {
        errorMessage = "Permission denied. You may not have the required permissions to create a survey.";
    } else if (error.message) {
        errorMessage = `Failed to create survey: ${error.message}`;
    }
    throw new Error(errorMessage);
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
        questions: (data.questions || []).map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: (q.options || []).map((opt: any) => ({ id: opt.id, value: opt.value } as SurveyQuestionOption))
        })),
        responseCount: data.responseCount,
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        questions: (data.questions || []).map((q: any) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: (q.options || []).map((opt: any) => ({ id: opt.id, value: opt.value } as SurveyQuestionOption))
        })),
        responseCount: data.responseCount,
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
      } as Survey;
    });
  } catch (error: any) {
    console.error("Error getting all surveys: ", error.message);
     if (error.code === 'failed-precondition') {
        const indexCreationLink = `https://console.firebase.google.com/v1/r/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClRwcm9qZWN0cy9pbnNpZ2h0cHVsc2UtNjIyZTAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1cnZleXMvaW5kZXhlcy9fEAEaDgoKY2FtcGFpZ25JZBABGg0KCWNyZWF0ZWRBdBACKAI%3D`;
        console.error(`Firestore index missing for 'surveys' collection. Please create the required composite index in your Firebase console: ${indexCreationLink}`);
        throw new Error(`Database query failed: missing index for surveys. Please create it here: ${indexCreationLink}`);
    }
    throw error;
  }
}

export async function updateSurvey(surveyId: string, surveyData: Partial<SurveyFormValues | { questions: SurveyQuestion[], responseCount?: number }>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const dataToUpdate: any = { ...surveyData, updatedAt: serverTimestamp() };

    if (surveyData.campaignId) {
        const campaignDoc = await getDoc(doc(db, 'campaigns', surveyData.campaignId));
        if (campaignDoc.exists()) dataToUpdate.campaignName = campaignDoc.data()?.title;
    }
    if (surveyData.rewardProgramId !== undefined) {
        if (surveyData.rewardProgramId) {
            const rewardProgramDoc = await getDoc(doc(db, 'rewardPrograms', surveyData.rewardProgramId));
            dataToUpdate.rewardProgramName = rewardProgramDoc.exists() ? rewardProgramDoc.data()?.name : undefined;
        } else {
            dataToUpdate.rewardProgramName = null;
        }
    }
    if (surveyData.questions) {
        dataToUpdate.questions = surveyData.questions.map(q => ({
            ...q,
            options: q.options ? q.options.map(opt => ({ value: typeof opt === 'string' ? opt : opt.value })) : []
        }));
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
    // Also delete subcollection of responses if it exists
    const responsesQuery = collection(db, `surveys/${surveyId}/responses`);
    const responsesSnapshot = await getDocs(responsesQuery);
    const batch = writeBatch(db);
    responsesSnapshot.forEach(responseDoc => {
        batch.delete(responseDoc.ref);
    });
    batch.delete(doc(db, 'surveys', surveyId));
    await batch.commit();
  } catch (error) {
    console.error("Error deleting survey and its responses: ", error);
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
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
       } as BrandProfile;
    }
    // If no profile exists, create and return a default one
    const defaultProfileData: Omit<BrandProfile, 'id' | 'updatedAt'> = {
        companyName: 'My Company',
        primaryColor: '#0B72B9',
        secondaryColor: '#60A5FA',
        toneOfVoice: 'Professional and Insightful',
        logoUrl: `https://picsum.photos/seed/defaultbrand/128/128`
    };
    await setDoc(docRef, { ...defaultProfileData, updatedAt: serverTimestamp() });
    return { id: BRAND_PROFILE_DOC_ID, ...defaultProfileData, updatedAt: new Date().toISOString() } as BrandProfile;

  } catch (error) {
    console.error("Error getting brand profile: ", error);
    return null; // Or throw error, depending on how you want to handle it upstream
  }
}

export async function updateBrandProfile(data: Partial<Omit<BrandProfile, 'id' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
  try {
    const docRef = doc(db, 'brandProfile', BRAND_PROFILE_DOC_ID);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
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
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
            createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
            updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
            createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
            updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
const DEFAULT_USER_ID = 'defaultUser';

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
                updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        return null; // Or throw error
    }
}

export async function updateUserPreferences(userId: string = DEFAULT_USER_ID, data: Partial<Omit<UserPreferences, 'id' | 'updatedAt'>>): Promise<void> {
  const db = getFirebaseFirestore();
    try {
        const docRef = doc(db, 'userPreferences', userId);
        await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
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
      avatarUrl: `https://picsum.photos/seed/${consumerData.email.split('@')[0]}/64/64`,
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
        lastActive: fromTimestampToString(data.lastActive as Timestamp | Date),
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
        lastActive: fromTimestampToString(data.lastActive as Timestamp | Date),
        createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
        updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
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
    // Consider implications: e.g., anonymize responses instead of deleting if linked to a consumer.
    // For now, simple delete.
    const docRef = doc(db, 'consumers', consumerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting consumer from Firestore: ", error);
    throw new Error("Failed to delete consumer profile.");
  }
}


// --- Dashboard KPI Data ---
export async function getKpiData(): Promise<KPIData> {
  const db = getFirebaseFirestore();
  try {
    const clientsSnapshot = await getCountFromServer(collection(db, 'clients'));
    const campaignsSnapshot = await getCountFromServer(collection(db, 'campaigns'));
    const surveysSnapshot = await getCountFromServer(collection(db, 'surveys'));

    // Sum of responseCount from all surveys
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
    // Fallback or rethrow, depending on desired error handling for the dashboard
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
                startDate: fromTimestampToString(data.startDate as Timestamp | Date),
                endDate: fromTimestampToString(data.endDate as Timestamp | Date),
                targetAudience: data.targetAudience,
                description: data.description,
                createdAt: fromTimestampToString(data.createdAt as Timestamp | Date),
                updatedAt: fromTimestampToString(data.updatedAt as Timestamp | Date),
            } as Campaign;
        });
    } catch (error) {
        console.error("Error getting recent campaigns: ", error);
        return [];
    }
}

// --- Mock Data for Charts/Insights (Can be replaced with actual queries) ---
// Ensure these are async if they are to be called from Server Components directly and might involve IO
export async function getResponseRateData(): Promise<{ name: string; sent: number; responses: number }[]> {
  // Simulate fetching and transforming data
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return [
    { name: 'Campaign A', sent: 500, responses: 350 },
    { name: 'Campaign B', sent: 700, responses: 450 },
    { name: 'Campaign C', sent: 300, responses: 150 },
  ];
}

export async function getRatingData(): Promise<{ name: string; value: number }[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return [
    { name: '5 Stars', value: 400 },
    { name: '4 Stars', value: 300 },
    { name: '3 Stars', value: 200 },
    { name: '2 Stars', value: 100 },
    { name: '1 Star', value: 50 },
  ];
}

export async function getCompletionTrendData(): Promise<{ name: string; completions: number; dropOffs: number }[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
  return [
    { name: 'Jan', completions: 200, dropOffs: 50 },
    { name: 'Feb', completions: 250, dropOffs: 40 },
    { name: 'Mar', completions: 300, dropOffs: 60 },
    { name: 'Apr', completions: 280, dropOffs: 30 },
  ];
}

// --- Mock for Report Types ---
// This function is intended to provide static data and does not need to be a Server Action.
// If it were to fetch from a DB, it would need to be async.
// For now, this is fine as it's just returning a static array.
// If specific "All" options are needed beyond fetched data.

export async function getMockReportTypes(): Promise<Array<{id: string, name: string}>> {
 await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async behavior
 return [
  { id: 'summary', name: 'Summary Report' },
  { id: 'cross_tab', name: 'Cross-Tabulation' },
  { id: 'demographics', name: 'Demographic Breakdown' },
  { id: 'sentiment', name: 'Sentiment Analysis (AI)' },
];
}

// This should be an async Server Action if fetching actual redemptions
export async function getRecentRedemptions(): Promise<Array<{id: string, userId: string, userName: string, reward: string, pointsCost: number, date: string}>> {
  // In a real app, fetch from a 'redemptions' collection in Firestore
  // For now, returning mock data
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
  return [
    { id: 'red_1', userId: 'user_abc', userName: 'John D.', reward: '$10 Amazon Card', pointsCost: 100, date: '2024-04-28' },
    { id: 'red_2', userId: 'user_xyz', userName: 'Jane S.', reward: '20% Off Coupon - SnackCo', pointsCost: 50, date: '2024-04-25' },
  ];
}


// --- Trend Data from Firestore ---
export async function getTrendData(): Promise<TrendData> {
  const db = getFirebaseFirestore();
  try {
    const trendDocRef = doc(db, 'trends', 'globalTrends'); // Assuming a single document for global trends
    const docSnap = await getDoc(trendDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Ensure data conforms to TrendData structure, providing defaults for missing fields
        return {
            productMentions: (data.productMentions || []).map((dp: any) => ({ date: dp.date, value: dp.value || 0 })),
            flavorPreferences: (data.flavorPreferences || []).map((dp: any) => ({ name: dp.name, value: dp.value || 0 })),
            sentimentOverTime: (data.sentimentOverTime || []).map((dp: any) => ({ date: dp.date, value: dp.value || 0 })),
        } as TrendData;
    } else {
      console.warn("No 'globalTrends' document found in 'trends' collection. Returning empty trend data.");
      // Create a default trend document if it doesn't exist
      const defaultTrendData: TrendData = {
        productMentions: [
            { date: "Jan", value: Math.floor(Math.random() * 50) + 10 },
            { date: "Feb", value: Math.floor(Math.random() * 50) + 15 },
            { date: "Mar", value: Math.floor(Math.random() * 50) + 20 },
            { date: "Apr", value: Math.floor(Math.random() * 50) + 25 },
        ],
        flavorPreferences: [
            { name: "Sweet", value: Math.floor(Math.random() * 200) + 50 },
            { name: "Spicy", value: Math.floor(Math.random() * 150) + 40 },
            { name: "Savory", value: Math.floor(Math.random() * 100) + 30 },
            { name: "Sour", value: Math.floor(Math.random() * 50) + 20 },
        ],
        sentimentOverTime: [
            { date: "Jan", value: Math.floor(Math.random() * 30) + 60 },
            { date: "Feb", value: Math.floor(Math.random() * 30) + 65 },
            { date: "Mar", value: Math.floor(Math.random() * 30) + 70 },
            { date: "Apr", value: Math.floor(Math.random() * 30) + 68 },
        ],
      };
      await setDoc(trendDocRef, defaultTrendData);
      console.log("Created default 'globalTrends' document.");
      return defaultTrendData;
    }
  } catch (error) {
    console.error("Error getting trend data from Firestore: ", error);
    throw new Error("Failed to fetch trend data.");
  }
}

// --- Survey Response Collection (Basic example) ---
export async function addSurveyResponse(surveyId: string, responseData: any): Promise<string> {
  const db = getFirebaseFirestore();
  try {
    const responseRef = await addDoc(collection(db, `surveys/${surveyId}/responses`), {
      ...responseData,
      submittedAt: serverTimestamp(),
    });
    // Optionally, increment responseCount on the survey document
    const surveyRef = doc(db, 'surveys', surveyId);
    await runTransaction(db, async (transaction) => {
      const surveyDoc = await transaction.get(surveyRef);
      if (!surveyDoc.exists()) {
        throw new Error("Survey does not exist!");
      }
      const newCount = (surveyDoc.data().responseCount || 0) + 1;
      transaction.update(surveyRef, { responseCount: newCount });
    });
    return responseRef.id;
  } catch (error) {
    console.error("Error adding survey response:", error);
    throw new Error("Failed to submit response.");
  }
}

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const db = getFirebaseFirestore();
  try {
    const q = query(collection(db, `surveys/${surveyId}/responses`), orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        // consumerId: data.consumerId, // if linking to consumers
        answers: data.answers, // Assuming answers is an object like { questionId1: answer1, questionId2: answer2 }
        submittedAt: fromTimestampToString(data.submittedAt as Timestamp | Date),
      } as SurveyResponse;
    });
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    return [];
  }
}
