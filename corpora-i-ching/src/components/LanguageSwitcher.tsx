import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
    const { languages, setLanguages } = useLanguage();

    // Count selected languages
    const selectedLanguagesCount = Object.values(languages).filter(Boolean).length;

    // Disable unselecting if only one language is selected
    const isLanguageDisabled = (langKey: keyof typeof languages) => {
        return selectedLanguagesCount === 1 && languages[langKey];
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="fixed bottom-4 right-6 rounded-full w-12 h-12 bg-black text-white hover:bg-gray-800 shadow-lg">
                    <Languages className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white shadow-lg">
                <DropdownMenuLabel>Show Languages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.zh}
                        onCheckedChange={(checked) => !isLanguageDisabled('zh') && setLanguages({ ...languages, zh: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('zh')}
                    />
                    中文
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.pinyin}
                        onCheckedChange={(checked) => !isLanguageDisabled('pinyin') && setLanguages({ ...languages, pinyin: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('pinyin')}
                    />
                    Pinyin
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.en}
                        onCheckedChange={(checked) => !isLanguageDisabled('en') && setLanguages({ ...languages, en: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('en')}
                    />
                    English
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Checkbox
                        checked={languages.es}
                        onCheckedChange={(checked) => !isLanguageDisabled('es') && setLanguages({ ...languages, es: !!checked })}
                        className="mr-2"
                        disabled={isLanguageDisabled('es')}
                    />
                    Español
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageSwitcher;