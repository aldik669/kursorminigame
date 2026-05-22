const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxAhffoaJfO1VCEL4_hBlxrl15ChKa7zN0PPTEghh3rlbYvs100eFJ2EadmTdl3iczrEw/exec";

function getSessionIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

let sessionId = getSessionIdFromUrl();
if (!sessionId) {
  sessionId = "CHILD_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

async function sendChildResultsToGoogleSheets(reg, final) {
  const childResult = final
    ? PROFILE_LABELS[final.topProfile]?.title || final.topProfile || ""
    : "";
  const finalPassport = final ? final.directions.join(", ") : "";
  const strengths = final ? final.strengths.join(", ") : "";
  const growthZones = final ? final.growthZones.join(", ") : "";

  const payload = {
    id: sessionId,
    childName: reg?.childName || "",
    childAge: String(reg?.childAge || ""),
    childCompleted: "Да",
    childResult,
    finalPassport,
    strengths,
    growthZones
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Child results sent to Google Sheets", payload);
    return true;
  } catch (error) {
    console.error("Google Sheets child send error:", error);
    return false;
  }
}

function clearLeadId() {}
