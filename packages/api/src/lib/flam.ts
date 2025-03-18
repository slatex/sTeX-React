import * as FLAMS from './flam-types';
export * from './flam-types';

export class FLAMSServer {
  _url: string;
  constructor(url: string) {
    this._url = url;
  }

  get url(): string {
    return this._url;
  }

  /**
   * All institutions and `archive.json`-registered documents
   */
  async index(): Promise<[FLAMS.Institution[], FLAMS.ArchiveIndex[]] | undefined> {
    return await this.rawPostRequest('api/index', {});
  }

  /**
   * Full-text search for documents, assuming the given filter
   */
  async searchDocs(
    query: string,
    filter: FLAMS.QueryFilter,
    numResults: number
  ): Promise<[number, FLAMS.SearchResult][] | undefined> {
    return await this.rawPostRequest('api/search', {
      query: query,
      opts: filter,
      num_results: numResults,
    });
  }

  /**
   * Full-text search for (definitions of) symbols
   */
  async searchSymbols(
    query: string,
    numResults: number
  ): Promise<[FLAMS.SymbolURI, [number, FLAMS.SearchResult][]][] | undefined> {
    return await this.rawPostRequest('api/search_symbols', {
      query: query,
      num_results: numResults,
    });
  }

  /**
   * List all archives/groups in the given group (or at top-level, if undefined)
   */
  async backendGroupEntries(
    in_entry?: string
  ): Promise<[FLAMS.ArchiveGroup[], FLAMS.Archive[]] | undefined> {
    return await this.rawPostRequest('api/backend/group_entries', { in: in_entry });
  }

  /**
   * List all directories/files in the given archive at path (or at top-level, if undefined)
   */
  async backendArchiveEntries(
    archive: string,
    in_path?: string
  ): Promise<[FLAMS.Directory[], FLAMS.File[]] | undefined> {
    return await this.rawPostRequest('api/backend/archive_entries', {
      archive: archive,
      path: in_path,
    });
  }

  /**
   * SPARQL query
   */
  async query(sparql: String): Promise<any> {
    return await this.rawPostRequest('api/backend/query', { query: sparql });
  }

  /**
   * Get all dependencies of the given archive (excluding meta-inf archives)
   */
  async archiveDependencies(archive: string): Promise<any> {
    return await this.rawPostRequest('api/backend/archive_dependencies', { archive: archive });
  }

  /**
   * Return the TOC of the given document
   */
  async contentToc(
    uri: FLAMS.DocumentURIParams
  ): Promise<[FLAMS.CSS[], FLAMS.TOCElem[]] | undefined> {
    return await this.rawGetRequest('content/toc', uri);
  }

  /**
   * Get all learning objects for the given symbol; if exercises === true, this includes Exercises and Subexercises;
   * otherwise, only definitions and examples.
   */
  async learningObjects(
    uri: FLAMS.SymbolURIParams,
    exercises?: boolean
  ): Promise<[[string, FLAMS.LOKind]] | undefined> {
    const exc = exercises ? exercises : false;
    const sym =
      'uri' in uri
        ? { uri: uri.uri, exercises: exc }
        : { a: uri.a, p: uri.p, m: uri.m, s: uri.s, exercises: exc };
    return await this.rawGetRequest('content/los', sym);
  }

  /**
   * Get the solution for the problem with the given URI. As string, so it can be
   * deserialized by the ts binding for the WASM datastructure
   */
  async solution(uri: FLAMS.DocumentElementURIParams): Promise<string | undefined> {
    let r = await this.getRequestI('content/solution', uri);
    if (r) {
      return await r.text();
    }
  }

  async contentDocument(
    uri: FLAMS.DocumentURIParams
  ): Promise<[FLAMS.DocumentURI, FLAMS.CSS[], string] | undefined> {
    return await this.rawGetRequest('content/document', uri);
  }

  async contentFragment(uri: FLAMS.URIParams): Promise<[FLAMS.CSS[], string] | undefined> {
    return await this.rawGetRequest('content/fragment', uri);
  }

  async rawGetRequest<TRequest extends Record<string, unknown>, TResponse>(
    endpoint: string,
    request: TRequest
  ): Promise<TResponse | undefined> {
    const response = await this.getRequestI(endpoint, request);
    if (response) {
      const j = await response.json();
      console.log('Response', endpoint, ':', j);
      return j as TResponse;
    }
  }

  private async getRequestI<TRequest extends Record<string, unknown>>(
    endpoint: string,
    request: TRequest
  ): Promise<Response | undefined> {
    const encodeParam = (v: unknown): string => {
      return encodeURIComponent(JSON.stringify(v));
    };
    const buildQueryString = (obj: unknown, prefix = ''): string[] => {
      const params: string[] = [];
      if (obj === null || obj === undefined) {
        return params;
      }
      if (Array.isArray(obj)) {
        if (prefix) {
          params.push(`${prefix}=${encodeParam(obj)}`);
        }
      } else if (typeof obj === 'string') {
        params.push(`${prefix}=${encodeURIComponent(obj)}`);
      } else if (typeof obj === 'object' && !(obj instanceof Date)) {
        if (prefix) {
          params.push(`${prefix}=${encodeParam(obj)}`);
        } else {
          for (const [key, value] of Object.entries(obj)) {
            const newPrefix = prefix ? `${prefix}[${key}]` : key;
            params.push(...buildQueryString(value, newPrefix));
          }
        }
      } else {
        const value = obj instanceof Date ? obj.toISOString() : obj;
        params.push(`${prefix}=${encodeParam(value)}`);
      }
      return params;
    };

    const queryString = buildQueryString(request).join('&');
    const url = `${this._url}/${endpoint}${queryString ? '?' + queryString : ''}`;
    console.log('Calling', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (response.ok) {
      return response;
    }
  }

  async rawPostRequest<TRequest extends Record<string, unknown>, TResponse>(
    endpoint: string,
    request: TRequest
  ): Promise<TResponse | undefined> {
    const response = await this.postRequestI(endpoint, request);
    if (response) {
      const j = await response.json();
      console.log(`Response ${this._url}/${endpoint} with body:`, j);
      return j as TResponse;
    }
  }

  private async postRequestI<TRequest extends Record<string, unknown>>(
    endpoint: string,
    request: TRequest
  ): Promise<Response | undefined> {
    const formData = new URLSearchParams();
    const appendToForm = (obj: unknown, prefix = ''): void => {
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => appendToForm(v, `${prefix}[${i}]`));
      } else if (obj instanceof Date) {
        formData.append(prefix, obj.toISOString());
      } else if (obj && typeof obj === 'object' && !(obj instanceof File)) {
        for (const [key, value] of Object.entries(obj)) {
          const newPrefix = prefix ? `${prefix}[${key}]` : key;
          appendToForm(value, newPrefix);
        }
      } else if (obj !== undefined && obj !== null) {
        formData.append(prefix, String(obj));
      }
    };
    appendToForm(request);
    console.log(`Calling ${this._url}/${endpoint} with body`, formData);
    const response = await fetch(`${this._url}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (response.ok) {
      return response;
    }
  }
}

//type IsEqual<T1,T2> = (T1 | T2) extends (T1 & T2) ? true : never;
