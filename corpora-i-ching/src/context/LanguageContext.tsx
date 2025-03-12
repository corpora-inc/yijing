// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface LanguageState {
    zh: boolean;
    en: boolean;
    es: boolean;
    pinyin: boolean; // Added Pinyin
}

interface LanguageContextProps {
    languages: LanguageState;
    setLanguages: React.Dispatch<React.SetStateAction<LanguageState>>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [languages, setLanguages] = useState<LanguageState>({
        zh: true,
        en: true,
        es: false,
        pinyin: false, // Default Pinyin off
    });

    return (
        <LanguageContext.Provider value={{ languages, setLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};