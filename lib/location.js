"use client";

// Sudanese cities with approximate GPS coordinates for fast offline distance calculation
export const SUDAN_CITIES = [
  { name: "الخرطوم", state: "ولاية الخرطوم", lat: 15.5007, lng: 32.5599 },
  { name: "أم درمان", state: "ولاية الخرطوم", lat: 15.6500, lng: 32.4800 },
  { name: "بحري", state: "ولاية الخرطوم", lat: 15.6445, lng: 32.5367 },
  { name: "بورتسودان", state: "ولاية البحر الأحمر", lat: 19.6175, lng: 37.2164 },
  { name: "ود مدني", state: "ولاية الجزيرة", lat: 14.4012, lng: 33.5199 },
  { name: "كسلا", state: "ولاية كسلا", lat: 15.4510, lng: 36.4000 },
  { name: "القضارف", state: "ولاية القضارف", lat: 14.0349, lng: 35.3834 },
  { name: "عطبرة", state: "ولاية نهر النيل", lat: 17.7022, lng: 33.9864 },
  { name: "الدامر", state: "ولاية نهر النيل", lat: 17.5922, lng: 33.9597 },
  { name: "شندي", state: "ولاية نهر النيل", lat: 16.6915, lng: 33.4344 },
  { name: "كوستي", state: "ولاية النيل الأبيض", lat: 13.1629, lng: 32.6635 },
  { name: "ربك", state: "ولاية النيل الأبيض", lat: 13.1809, lng: 32.7400 },
  { name: "سنار", state: "ولاية سنار", lat: 13.5691, lng: 33.5672 },
  { name: "سنجة", state: "ولاية سنار", lat: 13.1500, lng: 33.9333 },
  { name: "دنقلا", state: "الولاية الشمالية", lat: 19.1764, lng: 30.4736 },
  { name: "مروي", state: "الولاية الشمالية", lat: 18.4844, lng: 31.8122 },
  { name: "كريمة", state: "الولاية الشمالية", lat: 18.5500, lng: 31.8500 },
  { name: "حلفا القديمة", state: "الولاية الشمالية", lat: 21.7958, lng: 31.3789 },
  { name: "الأبيض", state: "ولاية شمال كردفان", lat: 13.1843, lng: 30.2167 },
  { name: "الفاشر", state: "ولاية شمال دارفور", lat: 13.6279, lng: 25.3494 },
  { name: "نيالا", state: "ولاية جنوب دارفور", lat: 12.0494, lng: 24.8922 },
  { name: "الجنينة", state: "ولاية غرب دارفور", lat: 13.4478, lng: 22.4489 },
  { name: "الدمازين", state: "إقليم النيل الأزرق", lat: 11.7611, lng: 34.3592 },
  { name: "سواكن", state: "ولاية البحر الأحمر", lat: 19.1059, lng: 37.3321 },
  { name: "حلفا الجديدة", state: "ولاية كسلا", lat: 15.3283, lng: 35.5975 },
];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestSudanCity(lat, lng) {
  let nearest = SUDAN_CITIES[0];
  let minDistance = Infinity;

  for (const city of SUDAN_CITIES) {
    const dist = getDistanceFromLatLonInKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...city, distanceKm: Math.round(dist) };
    }
  }

  return nearest;
}

export function getUserSavedLocation() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("sudanzon_user_location");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

export function saveUserLocation(locationData) {
  if (typeof window === "undefined") return;
  try {
    const dataWithTimestamp = {
      ...locationData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem("sudanzon_user_location", JSON.stringify(dataWithTimestamp));
    localStorage.setItem("sudanzon_location_prompted", "true");
    window.dispatchEvent(new CustomEvent("sudanzon-location-updated", { detail: dataWithTimestamp }));
  } catch (err) {
    console.error("Failed to save user location:", err);
  }
}

export async function reverseGeocode(lat, lng) {
  const nearestSudan = findNearestSudanCity(lat, lng);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=ar`,
      { headers: { "Accept-Language": "ar" } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.state_district ||
        addr.state ||
        nearestSudan.name;
      const suburb = addr.suburb || addr.neighbourhood || addr.road || "";
      const fullDisplay = suburb ? `${cityName} - ${suburb}` : cityName;

      return {
        lat,
        lng,
        city: cityName,
        suburb,
        state: addr.state || nearestSudan.state,
        country: addr.country || "السودان",
        formatted: fullDisplay || nearestSudan.name,
      };
    }
  } catch {
    // Fallback
  }

  return {
    lat,
    lng,
    city: nearestSudan.name,
    suburb: "",
    state: nearestSudan.state,
    country: "السودان",
    formatted: nearestSudan.name,
  };
}

export function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("متصفحك أو جهازك لا يدعم تحديد الموقع الجغرافي"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        try {
          const geoInfo = await reverseGeocode(latitude, longitude);
          const locationResult = {
            latitude,
            longitude,
            accuracy,
            city: geoInfo.city,
            suburb: geoInfo.suburb,
            state: geoInfo.state,
            country: geoInfo.country,
            formatted: geoInfo.formatted,
            source: "gps",
          };
          saveUserLocation(locationResult);
          resolve(locationResult);
        } catch (err) {
          const fallback = {
            latitude,
            longitude,
            accuracy,
            city: "الخرطوم",
            state: "ولاية الخرطوم",
            formatted: "الخرطوم",
            source: "gps",
          };
          saveUserLocation(fallback);
          resolve(fallback);
        }
      },
      (err) => {
        let msg = "تعذر الحصول على إذن الموقع";
        if (err.code === 1) msg = "تم رفض إذن الوصول إلى الموقع";
        if (err.code === 2) msg = "موقعك الحالي غير متاح حالياً";
        if (err.code === 3) msg = "انتهت مهلة طلب الموقع";
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
}

export function setUserManualCity(cityName) {
  const match = SUDAN_CITIES.find((c) => c.name === cityName) || {
    name: cityName,
    state: "السودان",
    lat: 15.5007,
    lng: 32.5599,
  };

  const locationData = {
    latitude: match.lat,
    longitude: match.lng,
    city: match.name,
    state: match.state,
    formatted: match.name,
    source: "manual",
  };
  saveUserLocation(locationData);
  return locationData;
}
