"use client";

// Comprehensive Sudanese cities and towns across all states with coordinates
export const SUDAN_CITIES = [
  // ولاية الخرطوم
  { name: "الخرطوم", state: "ولاية الخرطوم", lat: 15.5500, lng: 32.5300 },
  { name: "شرق النيل", state: "ولاية الخرطوم", lat: 15.5950, lng: 32.6300 },
  { name: "أم درمان", state: "ولاية الخرطوم", lat: 15.6500, lng: 32.4800 },
  { name: "بحري", state: "ولاية الخرطوم", lat: 15.6445, lng: 32.5367 },

  // ولاية القضارف
  { name: "القضارف", state: "ولاية القضارف", lat: 14.0349, lng: 35.3834 },
  { name: "الفاو", state: "ولاية القضارف", lat: 14.1200, lng: 34.3200 },
  { name: "القلابات", state: "ولاية القضارف", lat: 12.9600, lng: 36.1400 },
  { name: "الفشقة", state: "ولاية القضارف", lat: 14.3500, lng: 35.8500 },
  { name: "الحواتة", state: "ولاية القضارف", lat: 13.4100, lng: 34.6300 },
  { name: "دوكة", state: "ولاية القضارف", lat: 13.5200, lng: 35.7700 },

  // ولاية البحر الأحمر
  { name: "بورتسودان", state: "ولاية البحر الأحمر", lat: 19.6175, lng: 37.2164 },
  { name: "سواكن", state: "ولاية البحر الأحمر", lat: 19.1059, lng: 37.3321 },
  { name: "سنكات", state: "ولاية البحر الأحمر", lat: 18.8333, lng: 36.8333 },
  { name: "جبيت", state: "ولاية البحر الأحمر", lat: 18.9667, lng: 36.8333 },
  { name: "طوكر", state: "ولاية البحر الأحمر", lat: 18.4267, lng: 37.7289 },

  // ولاية الجزيرة
  { name: "ود مدني", state: "ولاية الجزيرة", lat: 14.4012, lng: 33.5199 },
  { name: "المناقل", state: "ولاية الجزيرة", lat: 14.2430, lng: 32.9850 },
  { name: "الحصاحيصا", state: "ولاية الجزيرة", lat: 14.7390, lng: 33.2980 },
  { name: "الكاملين", state: "ولاية الجزيرة", lat: 15.0833, lng: 32.9333 },
  { name: "رفاعة", state: "ولاية الجزيرة", lat: 14.7100, lng: 33.5100 },
  { name: "جياد", state: "ولاية الجزيرة", lat: 15.0100, lng: 32.8300 },

  // ولاية كسلا
  { name: "كسلا", state: "ولاية كسلا", lat: 15.4510, lng: 36.4000 },
  { name: "حلفا الجديدة", state: "ولاية كسلا", lat: 15.3283, lng: 35.5975 },
  { name: "خشم القربة", state: "ولاية كسلا", lat: 14.9600, lng: 35.9100 },
  { name: "أروما", state: "ولاية كسلا", lat: 15.8200, lng: 36.1400 },

  // ولاية نهر النيل
  { name: "عطبرة", state: "ولاية نهر النيل", lat: 17.7022, lng: 33.9864 },
  { name: "الدامر", state: "ولاية نهر النيل", lat: 17.5922, lng: 33.9597 },
  { name: "شندي", state: "ولاية نهر النيل", lat: 16.6915, lng: 33.4344 },
  { name: "بربر", state: "ولاية نهر النيل", lat: 18.0210, lng: 33.9850 },
  { name: "المتمة", state: "ولاية نهر النيل", lat: 16.7100, lng: 33.3600 },
  { name: "أبو حمد", state: "ولاية نهر النيل", lat: 19.5310, lng: 33.3190 },

  // الولاية الشمالية
  { name: "دنقلا", state: "الولاية الشمالية", lat: 19.1764, lng: 30.4736 },
  { name: "مروي", state: "الولاية الشمالية", lat: 18.4844, lng: 31.8122 },
  { name: "كريمة", state: "الولاية الشمالية", lat: 18.5500, lng: 31.8500 },
  { name: "وادي حلفا", state: "الولاية الشمالية", lat: 21.7958, lng: 31.3789 },
  { name: "القولد", state: "الولاية الشمالية", lat: 18.9100, lng: 30.5500 },
  { name: "الدبة", state: "الولاية الشمالية", lat: 18.0500, lng: 30.9500 },

  // ولاية سنار
  { name: "سنار", state: "ولاية سنار", lat: 13.5691, lng: 33.5672 },
  { name: "سنجة", state: "ولاية سنار", lat: 13.1500, lng: 33.9333 },
  { name: "السوكي", state: "ولاية سنار", lat: 13.3100, lng: 33.8800 },
  { name: "الدندر", state: "ولاية سنار", lat: 13.3200, lng: 34.2300 },

  // ولاية النيل الأبيض
  { name: "كوستي", state: "ولاية النيل الأبيض", lat: 13.1629, lng: 32.6635 },
  { name: "ربك", state: "ولاية النيل الأبيض", lat: 13.1809, lng: 32.7400 },
  { name: "الدويم", state: "ولاية النيل الأبيض", lat: 13.9960, lng: 32.3110 },
  { name: "القطينة", state: "ولاية النيل الأبيض", lat: 14.8600, lng: 32.3700 },
  { name: "تندلتي", state: "ولاية النيل الأبيض", lat: 12.9800, lng: 31.8700 },

  // ولاية شمال كردفان
  { name: "الأبيض", state: "ولاية شمال كردفان", lat: 13.1843, lng: 30.2167 },
  { name: "أم روابة", state: "ولاية شمال كردفان", lat: 12.9000, lng: 31.2200 },
  { name: "بارا", state: "ولاية شمال كردفان", lat: 13.7000, lng: 30.3600 },
  { name: "الرهد", state: "ولاية شمال كردفان", lat: 12.7200, lng: 30.6500 },

  // ولاية غرب كردفان
  { name: "الفولة", state: "ولاية غرب كردفان", lat: 11.7980, lng: 28.3980 },
  { name: "النهود", state: "ولاية غرب كردفان", lat: 12.7040, lng: 28.4310 },
  { name: "بابنوسة", state: "ولاية غرب كردفان", lat: 11.3300, lng: 27.8000 },
  { name: "المجلد", state: "ولاية غرب كردفان", lat: 11.0200, lng: 27.7300 },

  // ولاية جنوب كردفان
  { name: "كادوقلي", state: "ولاية جنوب كردفان", lat: 11.0110, lng: 29.7180 },
  { name: "الدلنج", state: "ولاية جنوب كردفان", lat: 12.0500, lng: 29.6500 },

  // إقليم النيل الأزرق
  { name: "الدمازين", state: "إقليم النيل الأزرق", lat: 11.7611, lng: 34.3592 },
  { name: "الروصيرص", state: "إقليم النيل الأزرق", lat: 11.8500, lng: 34.3800 },

  // ولايات دارفور
  { name: "الفاشر", state: "ولاية شمال دارفور", lat: 13.6279, lng: 25.3494 },
  { name: "نيالا", state: "ولاية جنوب دارفور", lat: 12.0494, lng: 24.8922 },
  { name: "الجنينة", state: "ولاية غرب دارفور", lat: 13.4478, lng: 22.4489 },
  { name: "الضعين", state: "ولاية شرق دارفور", lat: 11.4580, lng: 26.1280 },
  { name: "زالنجي", state: "ولاية وسط دارفور", lat: 12.9090, lng: 23.4750 },
];

// Detailed Khartoum localities and neighborhoods for hyper-local precision
export const KHARTOUM_LOCALITIES = [
  // شرق النيل
  { locality: "شرق النيل", neighborhood: "حي النصر", lat: 15.5890, lng: 32.6350 },
  { locality: "شرق النيل", neighborhood: "الفيحاء", lat: 15.6100, lng: 32.6200 },
  { locality: "شرق النيل", neighborhood: "الحاج يوسف", lat: 15.6420, lng: 32.6050 },
  { locality: "شرق النيل", neighborhood: "الجريف شرق", lat: 15.5600, lng: 32.6000 },
  { locality: "شرق النيل", neighborhood: "الوادي الأخضر", lat: 15.6700, lng: 32.6800 },
  { locality: "شرق النيل", neighborhood: "حلة كوكو", lat: 15.6200, lng: 32.5800 },
  { locality: "شرق النيل", neighborhood: "المايقوما", lat: 15.6350, lng: 32.6100 },
  { locality: "شرق النيل", neighborhood: "دردوق", lat: 15.6900, lng: 32.6400 },
  { locality: "شرق النيل", neighborhood: "سوبا شرق", lat: 15.5000, lng: 32.6600 },
  { locality: "شرق النيل", neighborhood: "العيلفون", lat: 15.4800, lng: 32.7500 },

  // بحري
  { locality: "بحري", neighborhood: "كافوري", lat: 15.6580, lng: 32.5720 },
  { locality: "بحري", neighborhood: "شمبات", lat: 15.6600, lng: 32.5300 },
  { locality: "بحري", neighborhood: "الصافية", lat: 15.6450, lng: 32.5400 },
  { locality: "بحري", neighborhood: "الصبابي", lat: 15.6350, lng: 32.5300 },
  { locality: "بحري", neighborhood: "الشعبية", lat: 15.6400, lng: 32.5350 },
  { locality: "بحري", neighborhood: "المزاد", lat: 15.6300, lng: 32.5400 },
  { locality: "بحري", neighborhood: "الدروشاب", lat: 15.7200, lng: 32.5600 },
  { locality: "بحري", neighborhood: "الكدرو", lat: 15.7500, lng: 32.5500 },
  { locality: "بحري", neighborhood: "الحلفايا", lat: 15.6900, lng: 32.5300 },
  { locality: "بحري", neighborhood: "الجيلي", lat: 16.0100, lng: 32.5800 },

  // أم درمان
  { locality: "أم درمان", neighborhood: "المهندسين", lat: 15.6100, lng: 32.4700 },
  { locality: "أم درمان", neighborhood: "الثورات", lat: 15.7000, lng: 32.4800 },
  { locality: "أم درمان", neighborhood: "الملازمين", lat: 15.6500, lng: 32.4950 },
  { locality: "أم درمان", neighborhood: "الموردة", lat: 15.6450, lng: 32.4900 },
  { locality: "أم درمان", neighborhood: "الفتيحاب", lat: 15.5800, lng: 32.4700 },
  { locality: "أم درمان", neighborhood: "بانت", lat: 15.6300, lng: 32.4800 },
  { locality: "أم درمان", neighborhood: "العباسية", lat: 15.6350, lng: 32.4750 },
  { locality: "أم درمان", neighborhood: "أمبدة", lat: 15.6500, lng: 32.4300 },
  { locality: "أم درمان", neighborhood: "أبو روف", lat: 15.6600, lng: 32.4950 },

  // الخرطوم (وسط وجنوب)
  { locality: "الخرطوم", neighborhood: "الرياض", lat: 15.5800, lng: 32.5650 },
  { locality: "الخرطوم", neighborhood: "العمارات", lat: 15.5700, lng: 32.5450 },
  { locality: "الخرطوم", neighborhood: "المعمورة", lat: 15.5450, lng: 32.5750 },
  { locality: "الخرطوم", neighborhood: "أركويت", lat: 15.5500, lng: 32.5600 },
  { locality: "الخرطوم", neighborhood: "الطائف", lat: 15.5650, lng: 32.5700 },
  { locality: "الخرطوم", neighborhood: "الصحافة", lat: 15.5350, lng: 32.5350 },
  { locality: "الخرطوم", neighborhood: "جبرة", lat: 15.5250, lng: 32.5200 },
  { locality: "الخرطوم", neighborhood: "الكلاكلة", lat: 15.4850, lng: 32.4850 },
  { locality: "الخرطوم", neighborhood: "الديم", lat: 15.5750, lng: 32.5300 },
  { locality: "الخرطوم", neighborhood: "الشجرة", lat: 15.5300, lng: 32.4950 },
  { locality: "الخرطوم", neighborhood: "سوبا غرب", lat: 15.5100, lng: 32.6100 },
  { locality: "الخرطوم", neighborhood: "الأزهري", lat: 15.5000, lng: 32.5500 },
  { locality: "الخرطوم", neighborhood: "السلمة", lat: 15.4800, lng: 32.5600 },
];

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
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

export function findNearestKhartoumLocality(lat, lng) {
  let nearest = KHARTOUM_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of KHARTOUM_LOCALITIES) {
    const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...loc, distanceKm: dist };
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
  const isKhartoumArea = lat >= 15.2 && lat <= 16.1 && lng >= 32.2 && lng <= 32.9;

  // 1. First Priority: BigDataCloud Reverse Geocoding (Client-side, CORS-friendly, Arabic)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
    );
    if (res.ok) {
      const data = await res.json();
      const adminList = data.localityInfo?.administrative || [];
      
      let stateName = data.principalSubdivision || nearestSudan.state || "السودان";
      let cityName = "";
      let suburbName = "";

      // Check administrative hierarchy from neighborhood level up
      for (let i = adminList.length - 1; i >= 0; i--) {
        const item = adminList[i];
        if (item.name && item.adminLevel >= 5 && item.adminLevel <= 8) {
          if (!cityName) {
            cityName = item.name;
          } else if (!suburbName && item.name !== cityName) {
            suburbName = item.name;
          }
        }
      }

      // If in Khartoum Area, apply hyper-local Khartoum locality matching
      if (isKhartoumArea || (stateName && stateName.includes("الخرطوم"))) {
        const khLoc = findNearestKhartoumLocality(lat, lng);
        if (khLoc) {
          cityName = khLoc.locality;
          suburbName = khLoc.neighborhood;
          stateName = "ولاية الخرطوم";
        }
      } else {
        if (!cityName || /^[A-Za-z\s]+$/.test(cityName)) {
          cityName = nearestSudan.name;
        }
      }

      const fullDisplay = suburbName && suburbName !== cityName 
        ? `${cityName} - ${suburbName}` 
        : (cityName || nearestSudan.name);

      return {
        lat,
        lng,
        city: cityName || nearestSudan.name,
        suburb: suburbName || "",
        state: stateName,
        country: data.countryName || "السودان",
        formatted: fullDisplay,
      };
    }
  } catch {
    // Continue to fallback
  }

  // 2. Second Priority: OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=ar`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      let cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.state_district ||
        addr.county ||
        nearestSudan.name;
      let suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || "";

      if (isKhartoumArea || (addr.state && addr.state.includes("الخرطوم"))) {
        const khLoc = findNearestKhartoumLocality(lat, lng);
        if (khLoc) {
          cityName = khLoc.locality;
          suburb = khLoc.neighborhood;
        }
      }

      const fullDisplay = suburb && suburb !== cityName ? `${cityName} - ${suburb}` : cityName;

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
    // Continue to fallback
  }

  // 3. Third Priority: Precision Mathematical Match using Coordinates (100% Guaranteed)
  let bestCity = nearestSudan.name;
  let bestState = nearestSudan.state;
  let bestSuburb = "";

  if (isKhartoumArea) {
    const khLoc = findNearestKhartoumLocality(lat, lng);
    if (khLoc) {
      bestCity = khLoc.locality;
      bestSuburb = khLoc.neighborhood;
      bestState = "ولاية الخرطوم";
    }
  }

  const fullDisplay = bestSuburb ? `${bestCity} - ${bestSuburb}` : bestCity;

  return {
    lat,
    lng,
    city: bestCity,
    suburb: bestSuburb,
    state: bestState,
    country: "السودان",
    formatted: fullDisplay,
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
            accuracy: Math.round(accuracy || 0),
            city: geoInfo.city,
            suburb: geoInfo.suburb,
            state: geoInfo.state,
            country: geoInfo.country,
            formatted: geoInfo.formatted,
            source: "gps",
          };
          saveUserLocation(locationResult);
          resolve(locationResult);
        } catch {
          // Guaranteed fallback from exact coordinates
          const nearest = findNearestSudanCity(latitude, longitude);
          const isKh = latitude >= 15.2 && latitude <= 16.1 && longitude >= 32.2 && longitude <= 32.9;
          let city = nearest.name;
          let state = nearest.state;
          let suburb = "";

          if (isKh) {
            const kh = findNearestKhartoumLocality(latitude, longitude);
            if (kh) {
              city = kh.locality;
              suburb = kh.neighborhood;
              state = "ولاية الخرطوم";
            }
          }

          const fallback = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy || 0),
            city,
            suburb,
            state,
            country: "السودان",
            formatted: suburb ? `${city} - ${suburb}` : city,
            source: "gps",
          };
          saveUserLocation(fallback);
          resolve(fallback);
        }
      },
      (err) => {
        let msg = "تعذر الحصول على إذن الموقع";
        if (err.code === 1) msg = "تم رفض إذن الوصول إلى الموقع، يرجى تفعيله من إعدادات المتصفح أو الجهاز";
        if (err.code === 2) msg = "موقعك الحالي غير متاح حالياً، يرجى التأكد من تشغيل الـ GPS";
        if (err.code === 3) msg = "انتهت مهلة طلب الموقع، يرجى المحاولة مجدداً";
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force fresh GPS coordinates instead of old cell tower caches
      }
    );
  });
}

export function setUserManualCity(cityName, suburbName = "") {
  // Check if it's a Khartoum locality/neighborhood
  const khMatch = KHARTOUM_LOCALITIES.find(
    (k) => k.neighborhood === cityName || k.neighborhood === suburbName || k.locality === cityName
  );

  const cityMatch = SUDAN_CITIES.find((c) => c.name === cityName);

  let lat = 15.5500;
  let lng = 32.5300;
  let state = "السودان";
  let city = cityName;
  let suburb = suburbName;

  if (khMatch && (cityName.includes("الخرطوم") || cityName.includes("شرق النيل") || cityName.includes("بحري") || cityName.includes("أم درمان") || suburbName)) {
    lat = khMatch.lat;
    lng = khMatch.lng;
    state = "ولاية الخرطوم";
    city = khMatch.locality;
    if (!suburb) suburb = khMatch.neighborhood;
  } else if (cityMatch) {
    lat = cityMatch.lat;
    lng = cityMatch.lng;
    state = cityMatch.state;
    city = cityMatch.name;
  }

  const formatted = suburb && suburb !== city ? `${city} - ${suburb}` : city;

  const locationData = {
    latitude: lat,
    longitude: lng,
    city,
    suburb,
    state,
    formatted,
    source: "manual",
  };
  saveUserLocation(locationData);
  return locationData;
}

