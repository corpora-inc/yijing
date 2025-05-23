import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Checkbox
            id="zh"
            checked={languages.zh}
            onCheckedChange={(checked) =>
              !isLanguageDisabled("zh") &&
              setLanguages({ ...languages, zh: !!checked })
            }
            className="mr-2"
            disabled={isLanguageDisabled("zh")}
          />
          <label htmlFor="zh">中文</label>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Checkbox
            checked={languages.pinyin}
            onCheckedChange={(checked) =>
              !isLanguageDisabled("pinyin") &&
              setLanguages({ ...languages, pinyin: !!checked })
            }
            className="mr-2"
            id="pinyin"
            disabled={isLanguageDisabled("pinyin")}
          />
          <label htmlFor="pinyin">Pinyin</label>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Checkbox
            checked={languages.en}
            onCheckedChange={(checked) =>
              !isLanguageDisabled("en") &&
              setLanguages({ ...languages, en: !!checked })
            }
            id="en"
            className="mr-2"
            disabled={isLanguageDisabled("en")}
          />
          <label htmlFor="en">English</label>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Checkbox
            checked={languages.es}
            onCheckedChange={(checked) =>
              !isLanguageDisabled("es") &&
              setLanguages({ ...languages, es: !!checked })
            }
            id="es"
            className="mr-2"
            disabled={isLanguageDisabled("es")}
          />
          <label htmlFor="es">Español</label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
