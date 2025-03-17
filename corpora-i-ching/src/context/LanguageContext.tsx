import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageState {
    zh: boolean;
    en: boolean;
    es: boolean;
    pinyin: boolean;
}

interface LanguageContextProps {
    languages: LanguageState;
    setLanguages: React.Dispatch<React.SetStateAction<LanguageState>>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialLanguages = localStorage.getItem('selectedLanguages');
    const parsedLanguages: LanguageState = initialLanguages
        ? JSON.parse(initialLanguages)
        : {
            zh: true,
            en: true,
            es: false,
            pinyin: false,
        };

    const [languages, setLanguages] = useState<LanguageState>(parsedLanguages);

    useEffect(() => {
        localStorage.setItem('selectedLanguages', JSON.stringify(languages));
    }, [languages]);

    return (
        <LanguageContext.Provider value={{ languages, setLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context as LanguageContextProps;
};