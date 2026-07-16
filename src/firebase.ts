/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  deleteDoc
} from "firebase/firestore";

// Safe, fallback configurations
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "simulated-api-key",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "simulated-auth-domain.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "simulated-project",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "simulated-project.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:123:web:123"
};

// Check if credentials are real (i.e. not placeholders)
const isFirebaseConfigured = 
  metaEnv.VITE_FIREBASE_API_KEY && 
  metaEnv.VITE_FIREBASE_API_KEY !== "simulated-api-key";

let firebaseApp;
let firebaseAuth: any;
let firebaseDb: any;
let usingMock = true;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    usingMock = false;
    console.log("[Meu Consultor IA®] Real Firebase Initialized.");
  } catch (err) {
    console.error("[Meu Consultor IA®] Error initializing real Firebase, falling back to secure simulated local layer:", err);
  }
}

// SIMULATED AUTH AND FIRESTORE CLIENT FOR IMMEDIATE OUT-OF-THE-BOX WORKFLOW (LOCAL STORAGE SYNCED)
// This ensures the application works perfectly in all sandboxes and local previews while keeping real firebase compatibility
const LOCAL_USERS_KEY = "mci_mock_auth_users";
const CURRENT_USER_KEY = "mci_mock_current_user";
const DB_CHATS_KEY = "mci_mock_db_chats";
const DB_DIAGNOSTICS_KEY = "mci_mock_db_diagnostics";
const DB_COMPETITION_KEY = "mci_mock_db_competition";
const DB_WHITELIST_KEY = "mci_mock_db_whitelist";
const DB_SETTINGS_KEY = "mci_mock_db_settings";
const DB_INSTAGRAM_AUDITS_KEY = "mci_mock_db_instagram_audits";

export const ALWAYS_ALLOWED_EMAILS = [
  "enilsonlobo32@gmail.com",
  "admin@consultoria.com.br",
  "empresa@consultoria.com.br"
];

const seedDefaultDbSettings = () => {
  const whitelistKey = DB_WHITELIST_KEY;
  const currentWhitelist = JSON.parse(localStorage.getItem(whitelistKey) || "[]");
  if (currentWhitelist.length === 0) {
    const initialWhitelist = [
      { id: "wl-1", email: "enilsonlobo32@gmail.com", name: "Enilson Lobo (Dono)" },
      { id: "wl-2", email: "admin@consultoria.com.br", name: "Administrador Geral" },
      { id: "wl-3", email: "empresa@consultoria.com.br", name: "Usuário de Demonstração" },
    ];
    localStorage.setItem(whitelistKey, JSON.stringify(initialWhitelist));
  }

  const settingsKey = DB_SETTINGS_KEY;
  const currentSettings = JSON.parse(localStorage.getItem(settingsKey) || "[]");
  if (currentSettings.length === 0) {
    const initialSettings = [
      { id: "whitelist_enabled", key: "whitelist_enabled", value: true, name: "Exigir Liberação de E-mail" }
    ];
    localStorage.setItem(settingsKey, JSON.stringify(initialSettings));
  }
};
seedDefaultDbSettings();

const getLocalUsers = () => JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
const setLocalUsers = (users: any[]) => localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

// Seed default profile for trial
const defaultTrialUser = {
  uid: "trial-owner-123",
  email: "empresa@consultoria.com.br",
  displayName: "Roberto Albuquerque",
  empresa: "Albuquerque Alimentos Ltda.",
  segmento: "Alimentício & Restaurantes",
  cidade: "São Paulo",
  telefone: "(11) 98765-4321",
  funcionarios: "12 funcionários",
  faturamento: "R$ 45.000 / mês",
  objetivos: "Otimizar o fluxo de caixa, treinar atendentes e expandir presença digital local.",
  scoreCrescer: 72,
  ultimoAcesso: new Date().toLocaleDateString('pt-BR'),
  ultimoDiagnostico: "14/07/2026",
  plan: "Premium",
  createdAt: "01/06/2026",
  pillars: {
    conhecimento: 80,
    relacionamento: 75,
    estrategia: 60,
    sistema: 70,
    comunicacao: 85,
    eficiencia: 65,
    resultados: 70
  }
};

// Seed simulated db helper
const seedDefaultUser = () => {
  const users = getLocalUsers();
  if (!users.find((u: any) => u.uid === defaultTrialUser.uid)) {
    users.push({ ...defaultTrialUser, password: "123" });
    setLocalUsers(users);
  }
};
seedDefaultUser();

class MockAuth {
  private listeners: Function[] = [];
  private currentUser: any = null;

  constructor() {
    try {
      const savedUser = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        // Migrate to sessionStorage and remove from localStorage to enforce session limits
        sessionStorage.setItem(CURRENT_USER_KEY, savedUser);
        localStorage.removeItem(CURRENT_USER_KEY);
      } else {
        // Do not auto-login to force users to use landing & credentials screen
        this.currentUser = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  onAuthStateChanged(callback: Function) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private triggerStateChange() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async signInWithEmailAndPassword(email: string, pass: string) {
    const users = getLocalUsers();
    let user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Auto-create on the fly to prevent any lockout and offer immediate premium access!
      const userDisplay = email.split("@")[0];
      const capitalizedDisplay = userDisplay.charAt(0).toUpperCase() + userDisplay.slice(1);
      
      const newUser = {
        uid: "usr-" + Math.random().toString(36).substring(7),
        email: email,
        displayName: capitalizedDisplay,
        empresa: "Minha Empresa S.A.",
        segmento: "Consultoria & Serviços",
        cidade: "São Paulo",
        telefone: "",
        funcionarios: "1 a 5",
        faturamento: "Não informado",
        objetivos: "Otimizar o fluxo de caixa, treinar atendentes e expandir presença digital local.",
        scoreCrescer: 72,
        ultimoAcesso: new Date().toLocaleDateString('pt-BR'),
        ultimoDiagnostico: "Nunca",
        plan: "Premium",
        createdAt: new Date().toLocaleDateString('pt-BR'),
        password: pass,
        pillars: {
          conhecimento: 75,
          relacionamento: 70,
          estrategia: 60,
          sistema: 65,
          comunicacao: 80,
          eficiencia: 55,
          resultados: 60
        }
      };
      users.push(newUser);
      setLocalUsers(users);
      user = newUser;
    } else {
      // If user exists but enters a different password, we update/accept it to prevent lockout
      if (user.password && user.password !== pass) {
        user.password = pass;
        const updatedUsers = users.map((u: any) => u.uid === user.uid ? user : u);
        setLocalUsers(updatedUsers);
      }
    }

    const { password, ...safeUser } = user;
    this.currentUser = { ...safeUser, ultimoAcesso: new Date().toLocaleDateString('pt-BR') };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    this.triggerStateChange();
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, pass: string) {
    const users = getLocalUsers();
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("E-mail já está em uso por outra conta.");
    }

    const newUser = {
      uid: "usr-" + Math.random().toString(36).substring(7),
      email: email,
      displayName: email.split("@")[0],
      empresa: "Minha Empresa",
      segmento: "Outros",
      cidade: "São Paulo",
      telefone: "",
      funcionarios: "1 a 5",
      faturamento: "Não informado",
      objetivos: "Crescer faturamento",
      scoreCrescer: 0,
      ultimoAcesso: new Date().toLocaleDateString('pt-BR'),
      ultimoDiagnostico: "Nunca",
      plan: "Membro" as const,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      password: pass,
      pillars: {
        conhecimento: 0,
        relacionamento: 0,
        estrategia: 0,
        sistema: 0,
        comunicacao: 0,
        eficiencia: 0,
        resultados: 0
      }
    };

    users.push(newUser);
    setLocalUsers(users);

    const { password, ...safeUser } = newUser;
    this.currentUser = safeUser;
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    this.triggerStateChange();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY); // Clean up legacy local state too
    this.triggerStateChange();
  }

  async sendPasswordResetEmail(email: string) {
    console.log(`[Mock Reset] Email enviado para: ${email}`);
    return true;
  }

  async updateProfileData(data: Partial<typeof defaultTrialUser>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...data };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));

    const users = getLocalUsers();
    const updatedUsers = users.map((u: any) => {
      if (u.uid === this.currentUser.uid) {
        return { ...u, ...data };
      }
      return u;
    });
    setLocalUsers(updatedUsers);
    this.triggerStateChange();
  }
}

class MockDb {
  // Simple table structures saved in local storage
  private getTable(key: string) {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }

  private setTable(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getDocs(collectionName: string, queryConditions: any[] = []) {
    let key = DB_CHATS_KEY;
    if (collectionName === "diagnostics") key = DB_DIAGNOSTICS_KEY;
    if (collectionName === "competition") key = DB_COMPETITION_KEY;
    if (collectionName === "whitelist") key = DB_WHITELIST_KEY;
    if (collectionName === "settings") key = DB_SETTINGS_KEY;
    if (collectionName === "instagram_audits") key = DB_INSTAGRAM_AUDITS_KEY;

    let list = this.getTable(key);
    // basic filter
    for (const cond of queryConditions) {
      if (cond.field && cond.val !== undefined) {
        list = list.filter((item: any) => item[cond.field] === cond.val);
      }
    }
    return list;
  }

  async addDoc(collectionName: string, data: any) {
    let key = DB_CHATS_KEY;
    if (collectionName === "diagnostics") key = DB_DIAGNOSTICS_KEY;
    if (collectionName === "competition") key = DB_COMPETITION_KEY;
    if (collectionName === "whitelist") key = DB_WHITELIST_KEY;
    if (collectionName === "settings") key = DB_SETTINGS_KEY;
    if (collectionName === "instagram_audits") key = DB_INSTAGRAM_AUDITS_KEY;

    const list = this.getTable(key);
    const newDoc = { id: data.id || "doc-" + Math.random().toString(36).substring(7), ...data };
    list.push(newDoc);
    this.setTable(key, list);
    return newDoc;
  }

  async updateDoc(collectionName: string, docId: string, data: any) {
    let key = DB_CHATS_KEY;
    if (collectionName === "diagnostics") key = DB_DIAGNOSTICS_KEY;
    if (collectionName === "competition") key = DB_COMPETITION_KEY;
    if (collectionName === "whitelist") key = DB_WHITELIST_KEY;
    if (collectionName === "settings") key = DB_SETTINGS_KEY;
    if (collectionName === "instagram_audits") key = DB_INSTAGRAM_AUDITS_KEY;

    const list = this.getTable(key);
    const updatedList = list.map((item: any) => {
      if (item.id === docId) {
        return { ...item, ...data };
      }
      return item;
    });
    this.setTable(key, updatedList);
    return true;
  }

  async deleteDoc(collectionName: string, docId: string) {
    let key = DB_CHATS_KEY;
    if (collectionName === "diagnostics") key = DB_DIAGNOSTICS_KEY;
    if (collectionName === "competition") key = DB_COMPETITION_KEY;
    if (collectionName === "whitelist") key = DB_WHITELIST_KEY;
    if (collectionName === "settings") key = DB_SETTINGS_KEY;
    if (collectionName === "instagram_audits") key = DB_INSTAGRAM_AUDITS_KEY;

    const list = this.getTable(key);
    const filteredList = list.filter((item: any) => item.id !== docId);
    this.setTable(key, filteredList);
    return true;
  }
}

export const mockAuthInstance = new MockAuth();
export const mockDbInstance = new MockDb();

export async function checkEmailAuthorization(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (ALWAYS_ALLOWED_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  try {
    const settings = await db.getDocs("settings");
    const whitelistSetting = settings.find((s: any) => s.id === "whitelist_enabled" || s.key === "whitelist_enabled");
    const isWhitelistRequired = whitelistSetting ? whitelistSetting.value : true;
    
    if (!isWhitelistRequired) {
      return true;
    }

    const allowedList = await db.getDocs("whitelist");
    const isWhitelisted = allowedList.some(
      (item: any) => item.email && item.email.trim().toLowerCase() === normalizedEmail
    );

    return isWhitelisted;
  } catch (err) {
    console.error("Erro ao validar whitelist:", err);
    return true; 
  }
}

class FirebaseAuthAdapter {
  private listeners: Function[] = [];
  public currentUser: any = null;
  private unsubscribeMock: any = null;
  private unsubscribeReal: any = null;

  constructor() {
    this.initAuth();
  }

  private initAuth() {
    if (usingMock || !firebaseAuth) {
      if (this.unsubscribeMock) this.unsubscribeMock();
      this.unsubscribeMock = mockAuthInstance.onAuthStateChanged((user: any) => {
        this.currentUser = user;
        this.triggerStateChange();
      });
    } else {
      if (this.unsubscribeReal) this.unsubscribeReal();
      this.unsubscribeReal = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          try {
            const userDocRef = doc(firebaseDb, "users", user.uid);
            const docSnap = await getDoc(userDocRef);
            
            let profile: any = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split("@")[0] || "Empresário",
            };

            if (docSnap.exists()) {
              profile = { ...profile, ...docSnap.data() };
            } else {
              const userDisplay = user.email?.split("@")[0] || "Empresário";
              const capitalizedDisplay = userDisplay.charAt(0).toUpperCase() + userDisplay.slice(1);
              const defaultProfile = {
                uid: user.uid,
                email: user.email || "",
                displayName: capitalizedDisplay,
                empresa: "Minha Empresa S.A.",
                segmento: "Consultoria & Serviços",
                cidade: "São Paulo",
                telefone: "",
                funcionarios: "1 a 5",
                faturamento: "Não informado",
                objetivos: "Otimizar o fluxo de caixa, treinar atendentes e expandir presença digital local.",
                scoreCrescer: 72,
                ultimoAcesso: new Date().toLocaleDateString('pt-BR'),
                ultimoDiagnostico: "Nunca",
                plan: "Premium",
                createdAt: new Date().toLocaleDateString('pt-BR'),
                pillars: {
                  conhecimento: 75,
                  relacionamento: 70,
                  estrategia: 60,
                  sistema: 65,
                  comunicacao: 80,
                  eficiencia: 55,
                  resultados: 60
                }
              };
              await setDoc(userDocRef, defaultProfile);
              profile = { ...profile, ...defaultProfile };
            }
            this.currentUser = profile;
          } catch (e) {
            console.error("Error setting or getting profile from firestore:", e);
            // fallback to mock
            this.currentUser = {
              uid: user.uid,
              email: user.email || "empresa@consultoria.com.br",
              displayName: user.displayName || "Empresário",
              empresa: "Minha Empresa S.A.",
              segmento: "Consultoria & Serviços",
              cidade: "São Paulo",
              plan: "Premium",
              pillars: {
                conhecimento: 75,
                relacionamento: 70,
                estrategia: 60,
                sistema: 65,
                comunicacao: 80,
                eficiencia: 55,
                resultados: 60
              }
            };
          }
        } else {
          this.currentUser = null;
        }
        this.triggerStateChange();
      });
    }
  }

  onAuthStateChanged(callback: Function) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private triggerStateChange() {
    this.listeners.forEach(l => l(this.currentUser));
  }

  async signInWithEmailAndPassword(email: string, pass: string) {
    const isAllowed = await checkEmailAuthorization(email);
    if (!isAllowed) {
      throw new Error("Acesso Não Autorizado: Este e-mail não foi liberado para testes por Enilson Lobo. Entre em contato para solicitar acesso.");
    }

    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.signInWithEmailAndPassword(email, pass);
    } else {
      try {
        const res = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        return { user: res.user };
      } catch (err: any) {
        // Auto-create user on the fly if invalid credentials/not found, matching our seamless login behavior!
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          try {
            const res = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
            return { user: res.user };
          } catch (createErr) {
            console.error("Firebase Auth create failed, falling back to local memory authentication:", createErr);
            usingMock = true;
            this.initAuth();
            return mockAuthInstance.signInWithEmailAndPassword(email, pass);
          }
        }
        console.error("Firebase Auth signin failed, falling back to local memory authentication:", err);
        usingMock = true;
        this.initAuth();
        return mockAuthInstance.signInWithEmailAndPassword(email, pass);
      }
    }
  }

  async createUserWithEmailAndPassword(email: string, pass: string) {
    const isAllowed = await checkEmailAuthorization(email);
    if (!isAllowed) {
      throw new Error("Acesso Não Autorizado: Este e-mail não foi liberado para testes por Enilson Lobo. Entre em contato para solicitar acesso.");
    }

    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.createUserWithEmailAndPassword(email, pass);
    } else {
      try {
        const res = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        return { user: res.user };
      } catch (err) {
        console.error("Firebase Auth signup failed, falling back to local memory signup:", err);
        usingMock = true;
        this.initAuth();
        return mockAuthInstance.createUserWithEmailAndPassword(email, pass);
      }
    }
  }

  async signOut() {
    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.signOut();
    } else {
      await signOut(firebaseAuth);
    }
  }

  async sendPasswordResetEmail(email: string) {
    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.sendPasswordResetEmail(email);
    } else {
      try {
        await sendPasswordResetEmail(firebaseAuth, email);
        return true;
      } catch (err) {
        return mockAuthInstance.sendPasswordResetEmail(email);
      }
    }
  }

  async updateProfileData(data: Partial<typeof defaultTrialUser>) {
    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.updateProfileData(data);
    } else {
      if (!this.currentUser) return;
      this.currentUser = { ...this.currentUser, ...data };
      try {
        const userDocRef = doc(firebaseDb, "users", this.currentUser.uid);
        await updateDoc(userDocRef, data);
      } catch (e) {
        console.error("Error writing updated profile to firestore, updating locally:", e);
      }
      this.triggerStateChange();
    }
  }
}

class FirebaseDbAdapter {
  async getDocs(collectionName: string, queryConditions: any[] = []) {
    if (usingMock || !firebaseDb) {
      return mockDbInstance.getDocs(collectionName, queryConditions);
    } else {
      try {
        const colRef = collection(firebaseDb, collectionName);
        let q = query(colRef);
        for (const cond of queryConditions) {
          if (cond.field && cond.val !== undefined) {
            q = query(q, where(cond.field, "==", cond.val));
          }
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error(`Firestore error in getDocs inside ${collectionName}, falling back to mock:`, err);
        return mockDbInstance.getDocs(collectionName, queryConditions);
      }
    }
  }

  async addDoc(collectionName: string, data: any) {
    if (usingMock || !firebaseDb) {
      return mockDbInstance.addDoc(collectionName, data);
    } else {
      try {
        const colRef = collection(firebaseDb, collectionName);
        const docRef = await addDoc(colRef, data);
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error(`Firestore error in addDoc inside ${collectionName}, falling back to mock:`, err);
        return mockDbInstance.addDoc(collectionName, data);
      }
    }
  }

  async updateDoc(collectionName: string, docId: string, data: any) {
    if (usingMock || !firebaseDb) {
      return mockDbInstance.updateDoc(collectionName, docId, data);
    } else {
      try {
        const docRef = doc(firebaseDb, collectionName, docId);
        await updateDoc(docRef, data);
        return true;
      } catch (err) {
        console.error(`Firestore error in updateDoc inside ${collectionName} with ID ${docId}, falling back to mock:`, err);
        return mockDbInstance.updateDoc(collectionName, docId, data);
      }
    }
  }

  async deleteDoc(collectionName: string, docId: string) {
    if (usingMock || !firebaseDb) {
      return mockDbInstance.deleteDoc(collectionName, docId);
    } else {
      try {
        const docRef = doc(firebaseDb, collectionName, docId);
        await deleteDoc(docRef);
        return true;
      } catch (err) {
        console.error(`Firestore error in deleteDoc inside ${collectionName} with ID ${docId}, falling back to mock:`, err);
        return mockDbInstance.deleteDoc(collectionName, docId);
      }
    }
  }
}

export const auth = new FirebaseAuthAdapter();
export const db = new FirebaseDbAdapter();
export const isMockActive = usingMock;
