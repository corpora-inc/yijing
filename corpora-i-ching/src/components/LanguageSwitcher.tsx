import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Languages, Github, Mail, Globe, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVersion } from "@tauri-apps/api/app";

const EMAIL = "team@encorpora.io";
const GITHUB_ISSUES = "https://github.com/corpora-inc/yijing/issues";
const WEB = "https://www.encorpora.io";

const LanguageSwitcher: React.FC = () => {
  const { languages, setLanguages } = useLanguage();
  const [appVersion, setAppVersion] = useState<string>("");

  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const version = await getVersion();
        setAppVersion(version);
      } catch (e) {
        console.error("Failed to get app version:", e);
        setAppVersion("N/A");
      }
    };

    fetchAppVersion();
  }, []);

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
        <Button className="fab-fixed rounded-full bg-black text-white hover:bg-gray-800">
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white shadow-lg w-64">
        <DropdownMenuLabel className="text-sm text-muted-foreground flex items-center">
          <Info className="w-3.5 h-3.5 mr-1.5" />
          About
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => window.open(GITHUB_ISSUES, "_blank")}
          >
            <Github className="w-3.5 h-3.5 mr-2" />
            <span>Report Issues</span>
            <DropdownMenuShortcut>
              <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                GitHub
              </span>
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => window.open(`mailto:${EMAIL}`, "_blank")}
          >
            <Mail className="w-3.5 h-3.5 mr-2" />
            <span>{EMAIL}</span>
            <DropdownMenuShortcut>
              <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                Email
              </span>
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => window.open(WEB, "_blank")}
          >
            <Globe className="w-3.5 h-3.5 mr-2" />
            <span>{WEB}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-sm text-muted-foreground flex items-center">
          <Languages className="w-3.5 h-3.5 mr-1.5" />
          Show languages
        </DropdownMenuLabel>
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
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-center text-muted-foreground">
          <span className="font-medium">Corpora Yi-Jing</span> • {appVersion}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
