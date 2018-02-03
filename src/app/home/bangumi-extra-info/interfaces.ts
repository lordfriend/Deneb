export interface BgmImage {
    large: string;
    medium: string;
    small: string;
    grid: string;
}

export interface Actor {
    id: number;
    url: string;
    name: string;
    images: BgmImage;
}

export interface Person {
    id: number;
    url: string;
    name: string;
    name_cn?: string;
    role_name: string;
    images: BgmImage | null;
    comment: number;
    collects: number;
    info: {name_cn: string, alias: {en: string}, gender: string};
}

export interface Character extends Person {
    actors: Actor[];
}

export interface Staff extends Person {
    jobs: string[];
}
