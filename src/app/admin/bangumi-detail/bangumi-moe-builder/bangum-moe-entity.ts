export class Tag {
    _id: string;
    activity: number;
    locale: { ja: string, zh_cn: string, zh_tw: string, en: string };
    name: string;
    syn_lowercase: string[];
    synonyms: string[];
    type: string
}
