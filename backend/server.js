require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// ✅ Allow both localhost and 127.0.0.1
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

// Debug logs
console.log("🔍 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log(
  "🔍 SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "LOADED" : "MISSING"
);

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ Save Access Data
app.post("/api/save-access", async (req, res) => {
  try {
    const { name, email, files } = req.body;

    if (!name || !email || !files) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("access_token")
      .insert([{ name, email, files }]) // ✅ NO stringify

      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify Access
app.post("/api/verify-access", async (req, res) => {
  try {
    const { name, email } = req.body;

    const { data, error } = await supabase
      .from("access_token")
      .select("files")
      .eq("name", name)
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ files: data.files }); // ✅ NO JSON.parse
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Backend running: http://localhost:3000");
});
