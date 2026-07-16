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
  let currentWhitelist = JSON.parse(localStorage.getItem(whitelistKey) || "[]");
  
  // Active migration: filter out any old occurrences of the owner's personal email from the visible local database list
  const filteredWhitelist = currentWhitelist.filter(
    (item: any) => item && item.email && item.email.toLowerCase() !== "enilsonlobo32@gmail.com"
  );
  
  if (currentWhitelist.length === 0) {
    const initialWhitelist = [
      { id: "wl-1", email: "mestre@consultoria.com.br", name: "Meu Consultor IA (Dono)" },
      { id: "wl-2", email: "admin@consultoria.com.br", name: "Administrador Geral" },
      { id: "wl-3", email: "empresa@consultoria.com.br", name: "Usuário de Demonstração" },
    ];
    localStorage.setItem(whitelistKey, JSON.stringify(initialWhitelist));
  } else if (filteredWhitelist.length !== currentWhitelist.length) {
    localStorage.setItem(whitelistKey, JSON.stringify(filteredWhitelist));
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
  empresa: "Autoescola Exemplo",
  segmento: "Educação para formação de condutores",
  cidade: "Angra dos Reis – RJ",
  telefone: "(11) 98765-4321",
  funcionarios: "12 funcionários",
  faturamento: "R$ 45.000 / mês",
  objetivos: "Aumentar matrículas",
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
  },
  hasCompletedInitialDiag: true,
  initialDiagAnswers: {
    empresa: "Autoescola Exemplo",
    segmento: "Educação para formação de condutores",
    mercado: "Serviços locais",
    cidade: "Angra dos Reis",
    uf: "RJ",
    publicoPredominante: "18 a 35 anos",
    principalObjetivo: "Aumentar matrículas",
    maiorGargalo: "Baixa geração de leads pelo Instagram e poucas avaliações no Google.",
    nivelMaturidadeDigital: 7,
    nivelOrganizacaoComercial: 6,
    prioridadeEstrategica: "Marketing e Conversão"
  },
  initialDiagReport: `📋 PERFIL ESTRATÉGICO DA EMPRESA

Empresa: Autoescola Exemplo

Segmento:
Educação para formação de condutores

Mercado:
Serviços locais

Cidade:
Angra dos Reis – RJ

Público predominante:
18 a 35 anos

Principal objetivo:
Aumentar matrículas

Maior gargalo:
Baixa geração de leads pelo Instagram e poucas avaliações no Google.

Nível de maturidade digital:
7/10

Nível de organização comercial:
6/10

Prioridade estratégica:
Marketing e Conversão.

Próxima etapa recomendada:
Auditoria de Instagram + Diagnóstico CRESCER™ + Plano de Marketing.`
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
      // Clean up legacy localStorage current user
      localStorage.removeItem(CURRENT_USER_KEY);
      
      const savedUser = sessionStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
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
      throw new Error("E-mail ou senha incorretos. Se este for seu primeiro acesso, clique na aba 'Cadastrar Minha Senha' no topo do formulário para registrar sua senha de acesso.");
    }

    if (user.password && user.password !== pass) {
      throw new Error("Senha incorreta. Se você esqueceu sua senha, utilize a redefinição.");
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

    const defaultAnswers = {
      empresa: "Autoescola Exemplo",
      segmento: "Educação para formação de condutores",
      mercado: "Serviços locais",
      cidade: "Angra dos Reis",
      uf: "RJ",
      publicoPredominante: "18 a 35 anos",
      principalObjetivo: "Aumentar matrículas",
      maiorGargalo: "Baixa geração de leads pelo Instagram e poucas avaliações no Google.",
      nivelMaturidadeDigital: 7,
      nivelOrganizacaoComercial: 6,
      prioridadeEstrategica: "Marketing e Conversão"
    };

    const defaultReport = `📋 PERFIL ESTRATÉGICO DA EMPRESA

Empresa: Autoescola Exemplo

Segmento:
Educação para formação de condutores

Mercado:
Serviços locais

Cidade:
Angra dos Reis – RJ

Público predominante:
18 a 35 anos

Principal objetivo:
Aumentar matrículas

Maior gargalo:
Baixa geração de leads pelo Instagram e poucas avaliações no Google.

Nível de maturidade digital:
7/10

Nível de organização comercial:
6/10

Prioridade estratégica:
Marketing e Conversão.

Próxima etapa recomendada:
Auditoria de Instagram + Diagnóstico CRESCER™ + Plano de Marketing.`;

    const newUser = {
      uid: "usr-" + Math.random().toString(36).substring(7),
      email: email,
      displayName: email.split("@")[0],
      empresa: "Autoescola Exemplo",
      segmento: "Educação para formação de condutores",
      cidade: "Angra dos Reis – RJ",
      telefone: "",
      funcionarios: "1 a 5",
      faturamento: "Não informado",
      objetivos: "Aumentar matrículas",
      scoreCrescer: 72,
      ultimoAcesso: new Date().toLocaleDateString('pt-BR'),
      ultimoDiagnostico: new Date().toLocaleDateString('pt-BR'),
      plan: "Premium" as const,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      password: pass,
      pillars: {
        conhecimento: 70,
        relacionamento: 65,
        estrategia: 60,
        sistema: 55,
        comunicacao: 75,
        eficiencia: 50,
        resultados: 60
      },
      hasCompletedInitialDiag: true,
      initialDiagAnswers: defaultAnswers,
      initialDiagReport: defaultReport
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
      throw new Error("Acesso Restrito: Este e-mail não possui liberação ativa para a plataforma Meu Consultor IA®. Entre em contato com a equipe de suporte para habilitar seu acesso.");
    }

    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.signInWithEmailAndPassword(email, pass);
    } else {
      try {
        const res = await signInWithEmailAndPassword(firebaseAuth, email, pass);
        return { user: res.user };
      } catch (err: any) {
        console.error("Erro ao autenticar no Firebase:", err);
        // If it's a real authentication credential error, throw the error directly to the user
        if (
          err.code === "auth/wrong-password" || 
          err.code === "auth/invalid-credential" || 
          err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-email"
        ) {
          throw new Error("E-mail ou senha incorretos. Se este for seu primeiro acesso, clique na aba 'Cadastrar Minha Senha' no topo do formulário para registrar sua senha de acesso.");
        }
        
        // Otherwise, it might be a connectivity/initialization fallback
        console.warn("Conexão falhou, caindo de volta para a camada local temporária.");
        usingMock = true;
        this.initAuth();
        return mockAuthInstance.signInWithEmailAndPassword(email, pass);
      }
    }
  }

  async createUserWithEmailAndPassword(email: string, pass: string) {
    const isAllowed = await checkEmailAuthorization(email);
    if (!isAllowed) {
      throw new Error("Acesso Restrito: Este e-mail não possui liberação ativa para a plataforma Meu Consultor IA®. Entre em contato com a equipe de suporte para habilitar seu acesso.");
    }

    if (usingMock || !firebaseAuth) {
      return mockAuthInstance.createUserWithEmailAndPassword(email, pass);
    } else {
      try {
        const res = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
        return { user: res.user };
      } catch (err: any) {
        if (err.code === "auth/email-already-in-use") {
          throw new Error("Este e-mail já possui uma conta cadastrada. Por favor, acesse utilizando a tela de login.");
        }
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
