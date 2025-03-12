import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageState {
    zh: boolean;
    en: boolean;
    es: boolean;
}

interface LanguageContextType {
    languages: LanguageState;
    setLanguages: React.Dispatch<React.SetStateAction<LanguageState>>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [languages, setLanguages] = useState<LanguageState>({
        zh: true,
        en: true,
        es: false,
    });

    return (
        <LanguageContext.Provider value={{ languages, setLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}