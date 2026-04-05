// ============ ACCOUNT / PROFILE SYSTEM ============
import { state, ADJEKTIVE, WESEN, events } from "./state.js";
import { getAllProfiles, saveProfiles, loadProfileData, profileKey } from "./storage.js";

function generateUsername() {
  const adj = ADJEKTIVE[Math.floor(Math.random() * ADJEKTIVE.length)];
  const wesen = WESEN[Math.floor(Math.random() * WESEN.length)];
  const zahl = Math.floor(Math.random() * 100);
  return `${adj}${wesen}${zahl}`;
}

export function generateUniqueName() {
  const profiles = getAllProfiles();
  const existing = new Set(profiles.map((p) => p.name));
  let name;
  let attempts = 0;
  do {
    name = generateUsername();
    attempts++;
  } while (existing.has(name) && attempts < 100);
  return name;
}

export function createProfile(name) {
  const profiles = getAllProfiles();
  const profile = { name, createdAt: Date.now() };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(name) {
  let profiles = getAllProfiles();
  profiles = profiles.filter((p) => p.name !== name);
  saveProfiles(profiles);
  const prefix = `mathe-${name}-`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function loginAs(name) {
  state.currentProfile = name;
  localStorage.setItem("mathe-last-profile", name);
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");
  loadProfileData();
  events.emit("init-app");
}

export function switchProfile() {
  document.getElementById("app-container").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  showLoginScreen();
}

export function showLoginScreen() {
  const profileList = document.getElementById("profile-list");
  const profiles = getAllProfiles();
  profileList.innerHTML = "";

  profiles.forEach((p) => {
    const stars = parseInt(localStorage.getItem(`mathe-${p.name}-sterne`) || "0", 10);
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <span class="profile-name">${p.name}</span>
      <span class="profile-stars">⭐ ${stars}</span>
      <button class="profile-delete" title="Profil löschen">&times;</button>
    `;
    card.querySelector(".profile-name").addEventListener("click", () => loginAs(p.name));
    card.querySelector(".profile-stars").addEventListener("click", () => loginAs(p.name));
    card.querySelector(".profile-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Profil "${p.name}" wirklich löschen?`)) {
        deleteProfile(p.name);
        showLoginScreen();
      }
    });
    profileList.appendChild(card);
  });

  const nameEl = document.getElementById("generated-name");
  nameEl.textContent = generateUniqueName();
}

export function exportProfileData() {
  if (!state.currentProfile) return null;
  const keys = ["sterne", "xp", "stages", "mastered", "achievements", "perfect-rounds", "errors", "skill-mastery", "practice-log"];
  const data = { name: state.currentProfile, version: 1 };
  keys.forEach((key) => {
    const val = localStorage.getItem(profileKey(key));
    if (val !== null) data[key] = val;
  });
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function importProfileData(code) {
  try {
    const json = decodeURIComponent(escape(atob(code.trim())));
    const data = JSON.parse(json);
    if (!data.name) throw new Error("Kein Name im Code");

    const profiles = getAllProfiles();
    if (!profiles.some((p) => p.name === data.name)) {
      createProfile(data.name);
    }

    const keys = ["sterne", "xp", "stages", "mastered", "achievements", "perfect-rounds", "errors", "skill-mastery", "practice-log"];
    keys.forEach((key) => {
      if (data[key] !== undefined) {
        localStorage.setItem(`mathe-${data.name}-${key}`, data[key]);
      }
    });

    return data.name;
  } catch (e) {
    return null;
  }
}

export function autoLogin() {
  const lastProfile = localStorage.getItem("mathe-last-profile");
  const profiles = getAllProfiles();
  if (lastProfile && profiles.some((p) => p.name === lastProfile)) {
    loginAs(lastProfile);
  } else {
    showLoginScreen();
  }
}
