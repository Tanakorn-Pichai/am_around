import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Language, LocationItem, ThemeMode } from '../types';
import { t } from '../utils/i18n';
import { checkAndNotifyMapsQuotaError } from '../utils/mapsQuota';

interface LocationPickerModalProps {
  isOpen: boolean;
  initialFocus: 'pickup' | 'destination';
  currentPickup: LocationItem;
  currentDestination: LocationItem;
  savedLocations: LocationItem[];
  lang: Language;
  theme: ThemeMode;
  onClose: () => void;
  onConfirmRoute: (pickup: LocationItem, destination: LocationItem) => void;
  onStartPinOnMap: (target: 'pickup' | 'destination') => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  initialFocus,
  currentPickup,
  currentDestination,
  savedLocations,
  lang,
  theme: _theme,
  onClose,
  onConfirmRoute,
  onStartPinOnMap,
}) => {
  const strings = t(lang);
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [activeField, setActiveField] = useState<'pickup' | 'destination'>(initialFocus);
  const [pickupQuery, setPickupQuery] = useState(currentPickup.name);
  const [destQuery, setDestQuery] = useState(currentDestination.name);
  const [selectedPickup, setSelectedPickup] = useState<LocationItem | null>(currentPickup);
  const [selectedDest, setSelectedDest] = useState<LocationItem | null>(currentDestination);
  const [errorType, setErrorType] = useState<'empty' | 'identical' | null>(null);

  const [placeSuggestions, setPlaceSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveField(initialFocus);
      setPickupQuery(currentPickup.name);
      setDestQuery(currentDestination.name);
      setSelectedPickup(currentPickup);
      setSelectedDest(currentDestination);
      setErrorType(null);
      setPlaceSuggestions([]);
      const timer = window.setTimeout(() => {
        if (initialFocus === 'pickup') {
          pickupInputRef.current?.focus();
          pickupInputRef.current?.select();
        } else {
          destInputRef.current?.focus();
          destInputRef.current?.select();
        }
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, initialFocus, currentPickup, currentDestination]);

  const activeQuery = activeField === 'pickup' ? pickupQuery : destQuery;

  // Modern Places API (New): AutocompleteSuggestion.fetchAutocompleteSuggestions with session token
  useEffect(() => {
    if (!isOpen || !placesLib) return;

    const trimmed = activeQuery.trim();
    const isInitialExactValue =
      (activeField === 'pickup' && trimmed === currentPickup.name) ||
      (activeField === 'destination' && trimmed === currentDestination.name);

    if (trimmed.length < 2 || isInitialExactValue) {
      setPlaceSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    let cancelled = false;
    setIsSearchingPlaces(true);

    const timer = window.setTimeout(async () => {
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }

        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['th'],
          language: lang,
          locationBias: {
            center: { lat: 13.8142, lng: 100.4985 },
            radius: 25000,
          },
        });

        if (!cancelled) {
          setPlaceSuggestions(res.suggestions ?? []);
        }
      } catch (err) {
        checkAndNotifyMapsQuotaError(err);
        if (!cancelled) {
          setPlaceSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingPlaces(false);
        }
      }
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, placesLib, activeQuery, activeField, currentPickup.name, currentDestination.name]);

  const filteredSavedLocations = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    if (!q) return savedLocations;
    const exactMatch = savedLocations.find((loc) => loc.name.toLowerCase() === q);
    if (exactMatch) return savedLocations;
    return savedLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.shortName.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q)
    );
  }, [activeQuery, savedLocations]);

  const handleSwap = () => {
    setPickupQuery(destQuery);
    setDestQuery(pickupQuery);
    setSelectedPickup(selectedDest);
    setSelectedDest(selectedPickup);
    setErrorType(null);
  };

  const handleUseCurrentLocation = () => {
    const fallbackLoc = savedLocations[0]; // เทศบาลเมืองบางกรวย
    if (!navigator.geolocation) {
      setPickupQuery(fallbackLoc.name);
      setSelectedPickup(fallbackLoc);
      setErrorType(null);
      setActiveField('destination');
      destInputRef.current?.focus();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const gpsLoc: LocationItem = {
          id: `gps_${lat.toFixed(5)}_${lng.toFixed(5)}`,
          name: `ตำแหน่งปัจจุบัน (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          shortName: 'ตำแหน่งปัจจุบัน',
          district: 'GPS ตำแหน่งของคุณ',
          lat,
          lng,
          isPinned: true,
        };
        setPickupQuery(gpsLoc.name);
        setSelectedPickup(gpsLoc);
        setErrorType(null);
        setActiveField('destination');
        destInputRef.current?.focus();
      },
      () => {
        setPickupQuery(fallbackLoc.name);
        setSelectedPickup(fallbackLoc);
        setErrorType(null);
        setActiveField('destination');
        destInputRef.current?.focus();
      },
      { timeout: 5000 }
    );
  };

  const resolveLocation = (
    query: string,
    selected: LocationItem | null,
    fallbackIndex: number
  ): LocationItem => {
    const trimmed = query.trim();
    if (selected && selected.name === trimmed) return selected;
    const matched = savedLocations.find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
    if (matched) return matched;
    const base = savedLocations[fallbackIndex % savedLocations.length];
    return {
      id: `custom_${trimmed}`,
      name: trimmed,
      shortName: trimmed.length > 14 ? `${trimmed.slice(0, 14)}…` : trimmed,
      district: 'กรุงเทพฯ และปริมณฑล',
      lat: base.lat + 0.004,
      lng: base.lng + 0.006,
    };
  };

  const validateAndSubmit = (
    nextPickup: LocationItem | null,
    nextDest: LocationItem | null,
    pText: string,
    dText: string
  ) => {
    const pTrim = pText.trim();
    const dTrim = dText.trim();

    if (!pTrim || !dTrim) {
      setErrorType('empty');
      return;
    }

    if (pTrim.toLowerCase() === dTrim.toLowerCase()) {
      setErrorType('identical');
      return;
    }

    const finalPickup = resolveLocation(pTrim, nextPickup, 0);
    const finalDest = resolveLocation(dTrim, nextDest, 1);

    if (
      finalPickup.id === finalDest.id ||
      (Math.abs(finalPickup.lat - finalDest.lat) < 0.0001 &&
        Math.abs(finalPickup.lng - finalDest.lng) < 0.0001)
    ) {
      setErrorType('identical');
      return;
    }

    setErrorType(null);
    onConfirmRoute(finalPickup, finalDest);
  };

  const applySelectedLocation = (loc: LocationItem) => {
    if (activeField === 'pickup') {
      setPickupQuery(loc.name);
      setSelectedPickup(loc);

      if (destQuery.trim().toLowerCase() === loc.name.toLowerCase()) {
        setErrorType('identical');
        return;
      }

      if (destQuery.trim()) {
        validateAndSubmit(loc, selectedDest, loc.name, destQuery);
      } else {
        setErrorType(null);
        setActiveField('destination');
        destInputRef.current?.focus();
      }
    } else {
      setDestQuery(loc.name);
      setSelectedDest(loc);

      if (pickupQuery.trim().toLowerCase() === loc.name.toLowerCase()) {
        setErrorType('identical');
        return;
      }

      if (pickupQuery.trim()) {
        validateAndSubmit(selectedPickup, loc, pickupQuery, loc.name);
      } else {
        setErrorType(null);
        setActiveField('pickup');
        pickupInputRef.current?.focus();
      }
    }
  };

  const handleSelectGooglePrediction = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;
    setIsFetchingDetails(true);
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      // CRITICAL: Reset session token after fetchFields completes
      sessionTokenRef.current = null;
      setPlaceSuggestions([]);

      if (place.location) {
        const displayName =
          place.displayName || suggestion.placePrediction.text?.text || 'สถานที่ที่เลือก';
        const loc: LocationItem = {
          id: place.id || `gplace_${Date.now()}`,
          name: displayName,
          shortName: displayName.length > 14 ? `${displayName.slice(0, 14)}…` : displayName,
          district: place.formattedAddress || 'ประเทศไทย',
          lat: place.location.lat(),
          lng: place.location.lng(),
        };
        applySelectedLocation(loc);
      }
    } catch (err) {
      checkAndNotifyMapsQuotaError(err);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  if (!isOpen) return null;

  const isPickupEmptyError = errorType === 'empty' && !pickupQuery.trim();
  const isDestEmptyError = errorType === 'empty' && !destQuery.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={strings.specifyPickupAndDest}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0.9 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.9 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] h-[94dvh] sm:h-[780px] bg-white dark:bg-[#111827] rounded-t-[24px] sm:rounded-[24px] flex flex-col overflow-hidden shadow-2xl transition-colors border-t sm:border border-transparent dark:border-white/10"
      >
        {/* Top Modal Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-[#F3F4F6] dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-white/10 text-[#111827] dark:text-white flex items-center justify-center active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            aria-label={strings.close}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-[17px] font-bold text-[#111827] dark:text-white">
            {strings.specifyPickupAndDest}
          </h2>
          <div className="w-11" />
        </div>

        {/* Inputs Panel */}
        <div className="px-5 pt-4 pb-3 bg-white dark:bg-[#111827] border-b border-[#F3F4F6] dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 flex flex-col gap-2.5 min-w-0">
              {/* Pickup Input */}
              <div
                className={`flex items-center gap-2.5 h-[46px] px-3 rounded-[12px] transition-colors border-[1.5px] ${
                  isPickupEmptyError
                    ? 'bg-[#FEF2F2] dark:bg-[#450a0a]/30 border-[#DC2626]'
                    : activeField === 'pickup'
                    ? 'bg-[#FFF5EC] dark:bg-[#FF6B00]/15 border-[#FF6B00]'
                    : 'bg-[#F5F5F7] dark:bg-[#182030] border-transparent dark:border-white/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] shrink-0" />
                <input
                  ref={pickupInputRef}
                  type="text"
                  value={pickupQuery}
                  onFocus={() => setActiveField('pickup')}
                  onChange={(e) => {
                    setPickupQuery(e.target.value);
                    setSelectedPickup(null);
                    setErrorType(null);
                  }}
                  placeholder={strings.searchPickupGmaps}
                  className="w-full bg-transparent text-[14px] font-medium text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none"
                  aria-label={strings.pickupLocation}
                />
                {pickupQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setPickupQuery('');
                      setSelectedPickup(null);
                      setActiveField('pickup');
                      pickupInputRef.current?.focus();
                    }}
                    className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#6B7280] dark:text-gray-400 shrink-0 cursor-pointer"
                    aria-label={strings.clearPickup}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Destination Input */}
              <div
                className={`flex items-center gap-2.5 h-[46px] px-3 rounded-[12px] transition-colors border-[1.5px] ${
                  isDestEmptyError
                    ? 'bg-[#FEF2F2] dark:bg-[#450a0a]/30 border-[#DC2626]'
                    : activeField === 'destination'
                    ? 'bg-[#FFF5EC] dark:bg-[#FF6B00]/15 border-[#FF6B00]'
                    : 'bg-[#F5F5F7] dark:bg-[#182030] border-transparent dark:border-white/5'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#111827] dark:bg-white shrink-0" />
                <input
                  ref={destInputRef}
                  type="text"
                  value={destQuery}
                  onFocus={() => setActiveField('destination')}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setSelectedDest(null);
                    setErrorType(null);
                  }}
                  placeholder={strings.searchDestGmaps}
                  className="w-full bg-transparent text-[14px] font-medium text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 focus:outline-none"
                  aria-label={strings.destinationLocation}
                />
                {destQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestQuery('');
                      setSelectedDest(null);
                      setActiveField('destination');
                      destInputRef.current?.focus();
                    }}
                    className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-[#6B7280] dark:text-gray-400 shrink-0 cursor-pointer"
                    aria-label={strings.clearDest}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Swap Locations Icon Button */}
            <button
              type="button"
              onClick={handleSwap}
              className="w-11 h-11 rounded-xl bg-[#FFF5EC] dark:bg-[#FF6B00]/20 hover:bg-[#FFEAD6] dark:hover:bg-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center shrink-0 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              aria-label={strings.swapLocations}
              title={strings.swapLocations}
            >
              <ArrowUpDown className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Client-Side Validation Banners */}
          {errorType === 'empty' && (
            <div
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-[10px] bg-[#FEF2F2] dark:bg-[#450a0a]/30 border border-[#FECACA] dark:border-red-950/60 px-3 py-2 text-[13px] text-[#B91C1C] dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{strings.errSpecifyBoth}</span>
            </div>
          )}

          {errorType === 'identical' && (
            <div
              role="alert"
              className="mt-3 flex items-center gap-2 rounded-[10px] bg-[#FFFBEB] dark:bg-[#451a03]/30 border border-[#FDE68A] dark:border-amber-950/60 px-3 py-2 text-[13px] text-[#92400E] dark:text-amber-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
              <span>{strings.errIdentical}</span>
            </div>
          )}

          {/* Quick Actions: Current Location + Pin Directly on Google Maps */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="min-h-[44px] px-3 py-2 rounded-[12px] bg-[#FFF5EC] dark:bg-[#FF6B00]/15 hover:bg-[#FFEAD6] dark:hover:bg-[#FF6B00]/25 text-[#FF6B00] flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{strings.useCurrentLocation}</span>
            </button>

            <button
              type="button"
              onClick={() => onStartPinOnMap(activeField)}
              className="min-h-[44px] px-3 py-2 rounded-[12px] bg-[#F5F5F7] dark:bg-[#182030] hover:bg-[#EBEBEF] dark:hover:bg-[#20293D] text-[#111827] dark:text-white border border-transparent dark:border-white/5 flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FF6B00]" />
              <span className="truncate">
                {activeField === 'pickup' ? strings.pinPickupOnMapBtn : strings.pinDestOnMapBtn}
              </span>
            </button>
          </div>
        </div>

        {/* Live Google Places Autocomplete Results + Suggested Landmarks */}
        <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-5 pt-3 pb-4">
          {(isSearchingPlaces || isFetchingDetails) && (
            <div className="flex items-center gap-2 py-2.5 text-[12px] text-[#6B7280] dark:text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B00]" />
              <span>
                {isFetchingDetails ? strings.fetchingCoordinates : strings.searchingPlacesGmaps}
              </span>
            </div>
          )}

          {placeSuggestions.length > 0 && (
            <div className="mb-4">
              <div className="text-[12px] font-semibold text-[#6B7280] dark:text-gray-400 mb-1.5">
                {strings.gmapsSearchResults}
              </div>
              <div className="divide-y divide-[#F3F4F6] dark:divide-white/10">
                {placeSuggestions.map((suggestion, idx) => {
                  const mainText =
                    suggestion.placePrediction?.mainText?.text ||
                    suggestion.placePrediction?.text?.text ||
                    '';
                  const secondaryText =
                    suggestion.placePrediction?.secondaryText?.text || '';
                  return (
                    <button
                      key={`${suggestion.placePrediction?.placeId ?? idx}`}
                      type="button"
                      disabled={isFetchingDetails}
                      onClick={() => void handleSelectGooglePrediction(suggestion)}
                      className="w-full min-h-[58px] py-2.5 flex items-center gap-3 text-left hover:bg-[#FAFAFB] dark:hover:bg-[#182030] active:bg-[#FFF5EC]/60 dark:active:bg-[#182030] px-1.5 -mx-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#FFF5EC] dark:bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center shrink-0">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#111827] dark:text-white truncate">
                          {mainText}
                        </div>
                        {secondaryText && (
                          <div className="text-[12px] text-[#6B7280] dark:text-gray-400 truncate mt-0.5">
                            {secondaryText}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-[12px] font-semibold text-[#6B7280] dark:text-gray-400 mb-2">
            {strings.recommendedAndRecent}
          </div>

          {filteredSavedLocations.length === 0 && placeSuggestions.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-[13px] text-[#6B7280] dark:text-gray-400">
                {strings.emptySearchPrompt}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F3F4F6] dark:divide-white/10">
              {filteredSavedLocations.map((loc) => {
                const isUsedAsPickup = loc.name === pickupQuery.trim();
                const isUsedAsDest = loc.name === destQuery.trim();
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => applySelectedLocation(loc)}
                    className="w-full min-h-[58px] py-2.5 flex items-center gap-3.5 text-left hover:bg-[#FAFAFB] dark:hover:bg-[#182030] active:bg-[#FFF5EC]/60 dark:active:bg-[#182030] px-1.5 -mx-1.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        loc.isRecent
                          ? 'bg-[#FFF5EC] dark:bg-[#FF6B00]/15 text-[#FF6B00]'
                          : 'bg-[#F5F5F7] dark:bg-[#182030] text-[#6B7280] dark:text-gray-400'
                      }`}
                    >
                      {loc.isRecent ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-[#111827] dark:text-white truncate">
                        {loc.name}
                      </div>
                      <div className="text-[12px] text-[#6B7280] dark:text-gray-400 truncate mt-0.5">
                        {loc.district}
                        {isUsedAsPickup && ` · ${strings.currentPickupBadge}`}
                        {isUsedAsDest && ` · ${strings.currentDestBadge}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm CTA Footer */}
        <div className="px-5 py-4 border-t border-[#F3F4F6] dark:border-white/10 bg-white dark:bg-[#111827] transition-colors">
          <button
            type="button"
            onClick={() =>
              validateAndSubmit(selectedPickup, selectedDest, pickupQuery, destQuery)
            }
            className="w-full h-[48px] rounded-full bg-[#FF6B00] hover:bg-[#EA6200] text-white font-display text-[15px] font-semibold active:scale-[0.98] transition-all shadow-[0_6px_14px_rgba(255,107,0,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 cursor-pointer"
          >
            {strings.searchRidesForRoute}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
