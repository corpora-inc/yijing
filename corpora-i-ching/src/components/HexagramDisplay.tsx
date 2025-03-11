import React from 'react';
import { Hexs, IChingHexagram } from '../App';
import ChangingLine from './ChangingLine';
import { CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

interface HexagramDisplayProps {
    title: string;
    hexs: Hexs;
    hexagram: IChingHexagram;
    languages: { zh: boolean; en: boolean; es: boolean };
    setLanguages: React.Dispatch<React.SetStateAction<{ zh: boolean; en: boolean; es: boolean }>>;
}

const HexagramDisplay: React.FC<HexagramDisplayProps> = ({ title, hexs, hexagram, languages, setLanguages }) => {
    const lines = title.includes('Original') ? hexs.original : hexs.transformed || [];
    const showAnyLanguage = languages.zh || languages.en || languages.es;

    return (
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{title}</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Languages className="h-4 w-4 mr-2" />
                            Languages
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Show Languages</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Checkbox
                                checked={languages.zh}
                                onCheckedChange={(checked) => setLanguages({ ...languages, zh: !!checked })}
                                className="mr-2"
                            />
                            Chinese (ZH)
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Checkbox
                                checked={languages.en}
                                onCheckedChange={(checked) => setLanguages({ ...languages, en: !!checked })}
                                className="mr-2"
                            />
                            English (EN)
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Checkbox
                                checked={languages.es}
                                onCheckedChange={(checked) => setLanguages({ ...languages, es: !!checked })}
                                className="mr-2"
                            />
                            Spanish (ES)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <pre className="font-mono text-lg mb-2 bg-gray-100 p-2 rounded-md">{lines.join('\n')}</pre>
            <div className="flex items-center space-x-4">
                <h1 className="text-4xl font-bold text-gray-800">{hexagram.chinese_name}</h1>
                <p className="text-lg italic">({hexagram.pinyin})</p>
                {languages.en && <p className="text-lg">{hexagram.english_name}</p>}
            </div>
            {showAnyLanguage && (
                <>
                    {languages.zh && <p><strong>Judgment (ZH):</strong> {hexagram.judgment_zh}</p>}
                    {languages.en && <p><strong>Judgment (EN):</strong> {hexagram.judgment_en}</p>}
                    {languages.es && <p><strong>Judgment (ES):</strong> {hexagram.judgment_es}</p>}
                </>
            )}
            {hexagram.changing_lines.length > 0 && showAnyLanguage && (
                <div className="space-y-2">
                    <h3 className="text-lg font-medium mt-4">Changing Lines</h3>
                    {hexagram.changing_lines.map((line) => (
                        <ChangingLine key={line.line_number} line={line} languages={languages} />
                    ))}
                </div>
            )}
        </CardContent>
    );
};

export default HexagramDisplay;