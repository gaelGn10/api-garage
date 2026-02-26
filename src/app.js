import express from "express";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// 🔥 Sécurité Firebase
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  throw new Error("Firebase environment variables are missing");
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

app.get("/reparations", async (req, res) => {
  try {
    const snapshot = await db.collection("reparation").get();
    const reparations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(reparations);
  } catch (err) {
    console.error("Erreur récupération réparations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ HANDLER VERCEL
export default function handler(req, res) {
  return app(req, res);
}
