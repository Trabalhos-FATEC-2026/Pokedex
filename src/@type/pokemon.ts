export interface Poder {
    nome: string;
    forca: number;
}

export interface Pokemon {
    id: number;      
    index: string;   
    nome: string;
    imagem: string;
    tipos: string[];
    poderes: Poder[];
}