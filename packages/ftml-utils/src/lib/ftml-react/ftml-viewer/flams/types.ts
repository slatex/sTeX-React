
export interface Settings {
  mathhubs: string[],
  debug:boolean,
  server: {
    port:number,
    ip:string
    database?:string
  },
  log_dir:string,
  buildqueue: {
    num_threads:number
  }
}


export interface BuildState {
  new:number,
  stale:number,
  deleted:number,
  up_to_date:number,
  last_built:number,
  last_changed:number
}

export interface ArchiveGroup {
  id: string,
  summary?: BuildState
}

export interface Archive {
  id: string,
  summary?: BuildState
}

export interface Directory {
  rel_path: string,
  summary?: BuildState
}

export interface File {
  rel_path: string,
  format: string
}

export interface Inputref {
  uri: string,
  id: string,
  children?: TOCElem[]
}

export interface Section {
  title?: string,
  uri: string,
  id: string,
  children?: TOCElem[]
}

export type TOCElem = {Inputref:Inputref} | {Section:Section};

export type LoginState = "Loading" | "Admin" | {User:string} | "None" | "NoAccounts";

export enum Language {
  English = "en",
  German = "de",
  French = "fr",
  Romanian = "ro",
  Arabic = "ar",
  Bulgarian = "bg",
  Russian = "ru",
  Finnish = "fi",
  Turkish = "tr",
  Slovenian = "sl",
}

export type DocumentURI = string;
export type SymbolURI = string;
export type DocumentElementURI = string;

export type CSS = { Link: string } | { Inline: string };

export type DocumentURIParams = {uri:DocumentURI} | 
  { a: string, rp: string } | 
  { a:string, p?:string, d:string, l:Language }
;

export type SymbolURIParams = {uri:SymbolURI} |
  { a:string, p?:string, m:string, s:string };

export type DocumentElementURIParams = {uri:DocumentElementURI} |
  {a:string, p?:string, d:string, l:Language, e:string};


export type URIParams = {uri:DocumentURI} | 
  { a:string} | // ArchiveURI
  { a: string, rp: string } | // DocumentURI 
  { a:string, p?:string, d:string, l?:Language } | // DocumentURI
  { a:string, p?:string, d:string, l?:Language, e:string } | // DocumentElementURI
  { a:string, p?:string, m:string, l?:Language } | // ModuleURI
  { a:string, p?:string, m:string, l?:Language, s:string } // SymbolURI
;

export type Institution = { title:string, place:string, country:string, url:string, acronym:string, logo:string, type:"university"|"school"};
export type ArchiveIndex =
  {type:"library", archive:string, title:string, teaser?:string, thumbnail?:string} |
  {type:"book", title:string, authors:string[], file:string, teaser?:string, thumbnail?:string} |
  {type:"paper", title:string, authors:string[], file:string, thumbnail?:string, teaser?:string, venue?:string, venue_url?:string} |
  {type:"course", title:string,landing:string, acronym?:string, instructors:string[], institution:string, notes:string, slides?:string, thumbnail?:string, quizzes:boolean, homeworks:boolean, instances:Instance[], teaser?:string} |
  {type:"self-study", title:string, landing:string, acronym?:string, notes:string, slides?:string, thumbnail?:string,teaser?:string };

export type Instance = {semester:string, instructors?:string[]};

export type CognitiveDimension = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";

export type LOKind = "Definition" | "Example" | { "Exercise": CognitiveDimension } | {"SubExercise": CognitiveDimension };