'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaUniversity, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { UNIVERSITIES } from '../../constants/universities';

interface UniversitySelectorProps {
  primaryUniversity: string;
  selectedUniversities: string[];
  onChangePrimary: (name: string) => void;
  onChangeNearby: (names: string[]) => void;
}

export default function UniversitySelector({
  primaryUniversity,
  selectedUniversities,
  onChangePrimary,
  onChangeNearby,
}: UniversitySelectorProps) {
  const [primarySearch, setPrimarySearch] = useState('');
  const [nearbySearch, setNearbySearch] = useState('');
  const [isOtherPrimary, setIsOtherPrimary] = useState(false);
  const [customPrimary, setCustomPrimary] = useState('');

  // Check if primaryUniversity is a custom one (i.e. not in our master list)
  useEffect(() => {
    if (primaryUniversity) {
      const exists = UNIVERSITIES.some(u => u.name === primaryUniversity);
      if (!exists && primaryUniversity !== '') {
        setIsOtherPrimary(true);
        setCustomPrimary(primaryUniversity);
      } else {
        setIsOtherPrimary(false);
        setCustomPrimary('');
      }
    } else {
      setIsOtherPrimary(false);
      setCustomPrimary('');
    }
  }, [primaryUniversity]);

  // Handle checking/unchecking "Other Institution"
  const handleOtherPrimaryChange = (checked: boolean) => {
    setIsOtherPrimary(checked);
    if (checked) {
      onChangePrimary(customPrimary || 'Other Institution');
    } else {
      onChangePrimary('');
    }
  };

  // Handle custom primary name input
  const handleCustomPrimaryChange = (value: string) => {
    setCustomPrimary(value);
    onChangePrimary(value);
  };

  // Filter primary universities
  const filteredPrimary = useMemo(() => {
    if (!primarySearch.trim()) return UNIVERSITIES;
    const query = primarySearch.toLowerCase().trim();
    return UNIVERSITIES.filter(
      uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.aliases.some(alias => alias.toLowerCase().includes(query))
    );
  }, [primarySearch]);

  // Filter nearby universities
  const filteredNearby = useMemo(() => {
    // Exclude the selected primary university from nearby candidates
    const candidates = UNIVERSITIES.filter(u => u.name !== primaryUniversity);
    if (!nearbySearch.trim()) return candidates;
    const query = nearbySearch.toLowerCase().trim();
    return candidates.filter(
      uni =>
        uni.name.toLowerCase().includes(query) ||
        uni.aliases.some(alias => alias.toLowerCase().includes(query))
    );
  }, [nearbySearch, primaryUniversity]);

  const toggleNearby = (uniName: string) => {
    if (selectedUniversities.includes(uniName)) {
      onChangeNearby(selectedUniversities.filter(u => u !== uniName));
    } else {
      if (selectedUniversities.length >= 10) {
        return; // Prevent adding more than 10
      }
      onChangeNearby([...selectedUniversities, uniName]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Primary University Section */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FaUniversity className="text-blue-600" />
          Primary University *
          <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-auto">
            Required
          </span>
        </label>

        {!isOtherPrimary ? (
          <div className="space-y-3">
            {/* Search Box */}
            <div className="relative">
              <FaSearch className="absolute top-4 left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search primary university..."
                value={primarySearch}
                onChange={e => setPrimarySearch(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none text-sm"
              />
              {primarySearch && (
                <button
                  type="button"
                  onClick={() => setPrimarySearch('')}
                  className="absolute top-3.5 right-4 p-1 text-slate-400 hover:text-slate-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* List */}
            <div className="grid gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar grid-cols-1 sm:grid-cols-2 border border-slate-50 p-2 rounded-2xl bg-slate-50/20">
              {filteredPrimary.length > 0 ? (
                filteredPrimary.map(uni => (
                  <button
                    key={`primary-${uni.name}`}
                    type="button"
                    onClick={() => onChangePrimary(uni.name)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                      primaryUniversity === uni.name
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50/30'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        primaryUniversity === uni.name
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {primaryUniversity === uni.name && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        primaryUniversity === uni.name ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {uni.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-xs font-semibold text-slate-400">
                  No institutions found. Check "Other Institution" below.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500">Custom Institution Name *</label>
            <div className="relative">
              <FaUniversity className="absolute top-4 left-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Korle-Bu Nursing Training College"
                value={customPrimary}
                onChange={e => handleCustomPrimaryChange(e.target.value)}
                className="w-full rounded-2xl border-2 border-blue-600 bg-white py-3.5 pr-4 pl-12 font-bold transition focus:outline-none text-sm text-slate-800 shadow-sm"
                required={isOtherPrimary}
              />
            </div>
          </div>
        )}

        {/* Other Institution Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition w-full sm:w-auto">
          <input
            type="checkbox"
            checked={isOtherPrimary}
            onChange={e => handleOtherPrimaryChange(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <span className="text-xs font-bold text-slate-600">
            Other Institution (My school is not listed)
          </span>
        </label>
      </div>

      {/* Nearby Universities Section */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <FaCheck className="text-emerald-500" />
          Additional Nearby Universities
          <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
            {selectedUniversities.length} / 10 Selected
          </span>
        </label>

        {/* Selected Universities Quick View / Tags */}
        {selectedUniversities.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-150/50">
            {selectedUniversities.map(uni => (
              <span
                key={`tag-${uni}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-sm"
              >
                <span className="truncate max-w-[180px]">{uni}</span>
                <button
                  type="button"
                  onClick={() => toggleNearby(uni)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <FaSearch className="absolute top-4 left-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search nearby universities..."
              value={nearbySearch}
              onChange={e => setNearbySearch(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 pr-4 pl-12 font-medium transition focus:border-blue-600 focus:bg-white focus:outline-none text-sm"
            />
            {nearbySearch && (
              <button
                type="button"
                onClick={() => setNearbySearch('')}
                className="absolute top-3.5 right-4 p-1 text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* List */}
          <div className="grid gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar grid-cols-1 sm:grid-cols-2 border border-slate-50 p-2 rounded-2xl bg-slate-50/20">
            {filteredNearby.length > 0 ? (
              filteredNearby.map(uni => {
                const isSelected = selectedUniversities.includes(uni.name);
                const isMaxReached = selectedUniversities.length >= 10 && !isSelected;

                return (
                  <button
                    key={`nearby-${uni.name}`}
                    type="button"
                    disabled={isMaxReached}
                    onClick={() => toggleNearby(uni.name)}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                        : isMaxReached
                        ? 'opacity-40 cursor-not-allowed border-slate-50 bg-slate-50/20'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50/30'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {isSelected && <FaCheck className="text-[10px] text-white" />}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {uni.name}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-xs font-semibold text-slate-400">
                No matching institutions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
