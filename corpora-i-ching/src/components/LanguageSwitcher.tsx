import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

const LanguageSwitcher: React.FC = () => {
  const { languages, setLanguages } = useLanguage();

  // Count selected languages
  const selectedLanguagesCount =
    Object.values(languages).filter(Boolean).length;

  // Disable unselecting if only one language is selected
  const isLanguageDisabled = (langKey: keyof typeof languages) => {
    return selectedLanguagesCount === 1 && languages[langKey];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <Button className="fixed right-10 bottom-10 rounded-full bg-black text-white hover:bg-gray-800" */}
        <Button className="fab-fixed rounded-full bg-black text-white hover:bg-gray-800">
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white shadow-lg">
        <DropdownMenuLabel>Show Languages</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          onSelect={(e) => e.preventDefault()}
          checked={languages.zh}
          onCheckedChange={(checked) =>
            !isLanguageDisabled("zh") &&
            setLanguages({ ...languages, zh: !!checked })
          }
          className="mr-2"
          disabled={isLanguageDisabled("zh")}
        >
          中文
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          onSelect={(e) => e.preventDefault()}
          checked={languages.pinyin}
          onCheckedChange={(checked) =>
            !isLanguageDisabled("pinyin") &&
            setLanguages({ ...languages, pinyin: !!checked })
          }
          className="mr-2"
          disabled={isLanguageDisabled("pinyin")}
        >
          Pinyin
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          onSelect={(e) => e.preventDefault()}
          checked={languages.en}
          onCheckedChange={(checked) =>
            !isLanguageDisabled("en") &&
            setLanguages({ ...languages, en: !!checked })
          }
          className="mr-2"
          disabled={isLanguageDisabled("en")}
        >
          English
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          onSelect={(e) => e.preventDefault()}
          checked={languages.es}
          onCheckedChange={(checked) =>
            !isLanguageDisabled("es") &&
            setLanguages({ ...languages, es: !!checked })
          }
          className="mr-2"
          disabled={isLanguageDisabled("es")}
        >
          Español
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
