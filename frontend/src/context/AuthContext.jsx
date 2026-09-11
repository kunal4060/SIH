import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { getTranslation } from '../utils/translations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_farm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_farm_token'));
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => localStorage.getItem('smart_farm_lang') || 'en');
  const [activeScanContext, setActiveScanContext] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('smart_farm_user', JSON.stringify(res.data));
          // If location is default Maharashtra or unset, attempt real location detection
          if (!res.data.location || res.data.location === 'Maharashtra, India') {
            detectRealLocation(false);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      // Attempt location detection for guest / early load
      const savedLoc = localStorage.getItem('smart_farm_real_location');
      if (!savedLoc) {
        detectRealLocation(false);
      }
    }
  }, [token]);

  const updateLocation = async (newLocation) => {
    if (!newLocation || !newLocation.trim()) return;
    const clean = newLocation.trim();
    localStorage.setItem('smart_farm_real_location', clean);
    
    if (user) {
      const updated = { ...user, location: clean };
      setUser(updated);
      localStorage.setItem('smart_farm_user', JSON.stringify(updated));
      try {
        await authAPI.updateProfile({ location: clean });
      } catch (err) {
        console.warn("Location profile update backend error:", err);
      }
    } else {
      setUser(prev => prev ? { ...prev, location: clean } : { location: clean });
    }
  };

  const detectRealLocation = async (forceAlert = true) => {
    setDetectingLocation(true);

    const resolveWithCoords = async (lat, lon) => {
      try {
        // High accuracy reverse geocode via BigDataCloud client API (free, reliable, zero key needed)
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (res.ok) {
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision || data.countryName;
          const state = data.principalSubdivision || '';
          const country = data.countryName || 'India';
          const detectedStr = [city, state, country].filter(Boolean).slice(0, 2).join(', ');
          if (detectedStr) {
            await updateLocation(detectedStr);
            return detectedStr;
          }
        }
      } catch (e) {
        console.warn("Reverse geocode failed, trying Open-Meteo reverse:", e);
      }
      return null;
    };

    // 1. Try Browser HTML5 Geolocation
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const loc = await resolveWithCoords(latitude, longitude);
          setDetectingLocation(false);
        },
        async (err) => {
          console.info("GPS geolocation unavailable or denied, falling back to IP geolocation:", err.message);
          // 2. Fallback to IP geolocation
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.city) {
                const ipLoc = `${ipData.city}, ${ipData.region || ipData.country_name}`;
                await updateLocation(ipLoc);
              }
            }
          } catch (ipErr) {
            console.warn("IP geolocation fallback failed:", ipErr);
          }
          setDetectingLocation(false);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setDetectingLocation(false);
    }
  };

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('smart_farm_token', access_token);
    localStorage.setItem('smart_farm_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('smart_farm_token', access_token);
    localStorage.setItem('smart_farm_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smart_farm_token');
    localStorage.removeItem('smart_farm_user');
  };

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    localStorage.setItem('smart_farm_lang', lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      localStorage.setItem('smart_farm_user', JSON.stringify(updated));
      try {
        await authAPI.updateProfile({ language: lang });
      } catch (err) {
        console.warn("Language update profile error:", err);
      }
    }
  };

  const t = (key) => getTranslation(language, key);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        language,
        t,
        activeScanContext,
        detectingLocation,
        detectRealLocation,
        updateLocation,
        setActiveScanContext,
        login,
        register,
        logout,
        changeLanguage,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
