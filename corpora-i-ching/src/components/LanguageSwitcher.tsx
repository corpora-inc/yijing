import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Languages, Github, Mail, Globe, } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";

const SUPPORT_EMAIL = "team@encorpora.io";
const GITHUB_ISSUES = "https://github.com/corpora-inc/yijing/issues";
const WEB = "encorpora.io";

const LanguageSwitcher: React.FC = () => {
  const { languages, setLanguages } = useLanguage();
  const [appVersion, setAppVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion("N/A"));
  }, []);

  const selectedCount = Object.values(languages).filter(Boolean).length;
  const disableLang = (k: keyof typeof languages) =>
    selectedCount === 1 && languages[k];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 bg-black hover:bg-gray-800 text-white"
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-white shadow-lg">

        <DropdownMenuGroup className="space-y-3 p-1">
          {/* Website */}
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full justify-start px-4 py-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => openUrl(`https://www.${WEB}`)}
            >
              <Globe className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left">{WEB}</span>
            </Button>
          </DropdownMenuItem>
          {/* Support Email */}
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full justify-start px-4 py-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => openUrl(`mailto:${SUPPORT_EMAIL}`)}
            >
              <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left">{SUPPORT_EMAIL}</span>
            </Button>
          </DropdownMenuItem>
          {/* Report Issues */}
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full justify-start px-4 py-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => openUrl(GITHUB_ISSUES)}
            >
              <Github className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left">Report Issues</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-2 bg-gray-200" />

        {/* Language toggles */}
        {/* <DropdownMenuLabel className="text-center text-base font-medium flex items-center space-x-2 px-4 py-2">
          <Languages className="w-5 h-5" />
          <span>Show languages</span>
        </DropdownMenuLabel> */}

        {(["zh", "pinyin", "en", "es"] as (keyof typeof languages)[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onSelect={(e) => e.preventDefault()}
            className="px-4 py-3"
          >
            <div className="flex items-center space-x-3">
              <Checkbox
                id={key}
                checked={languages[key]}
                onCheckedChange={(c) =>
                  !disableLang(key) && setLanguages({ ...languages, [key]: !!c })
                }
                className="h-6 w-6 flex-shrink-0 cursor-pointer"
                disabled={disableLang(key)}
              />
              <label htmlFor={key} className="text-lg select-none cursor-pointer">
                {key === "zh"
                  ? "中文"
                  : key === "pinyin"
                    ? "Pinyin"
                    : key === "en"
                      ? "English"
                      : "Español"}
              </label>
            </div>
          </DropdownMenuItem>
        ))}

        <div className="px-4 py-3 text-center text-sm text-muted-foreground">
          <span className="font-medium">Corpora Yìjīng</span> • {appVersion}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
