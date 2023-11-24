import { SectionsAPIData } from '@stex-react/api';
import {
  FileLocation,
  FileLocationEquals,
  fileLocToString,
  getSectionInfo,
} from '@stex-react/utils';

enum DocFragDisplayStatus {
  NOT_LOADED,
  PLACEHOLDER,
  TO_BE_SHOWN,
}

function getFileLocationHierarchy(
  sectionId: string,
  s: SectionsAPIData,
  currentH: FileLocation[] = []
): FileLocation[] | undefined {
  if (s.id === sectionId) return currentH;

  for (const child of s.children) {
    const nextH = [...currentH];
    if (s.archive && s.filepath) {
      nextH.push({ archive: s.archive, filepath: s.filepath });
    }
    const hierarchy = getFileLocationHierarchy(sectionId, child, nextH);
    if (hierarchy) return hierarchy;
  }
  return undefined;
}

export class DocFragManager {
  public docSections: SectionsAPIData | undefined = undefined;
  private fileLocElementMap = new Map<string, HTMLElement>();
  private docFragDisplayStatus = new Map<string, DocFragDisplayStatus>();
  private scrollFileLocHierarchy = [] as FileLocation[];
  private toScrollSectionId = undefined as string | undefined;

  scrollReset() {
    console.log('scroll reset');
    this.scrollFileLocHierarchy = [];
    this.toScrollSectionId = undefined;
  }

  scrollToSection(sectionId?: string) {
    if (!sectionId?.length) {
      this.scrollReset();
      return;
    }
    console.log('start scroll: ', sectionId);
    this.toScrollSectionId = sectionId;
    this.createFileLocHeirarchy();
  }

  createFileLocHeirarchy() {
    if (!this.toScrollSectionId || !this.docSections) return;
    this.scrollFileLocHierarchy =
      getFileLocationHierarchy(this.toScrollSectionId, this.docSections) ?? [];
    console.log('fileLocHierarchy', this.scrollFileLocHierarchy);
    if(!this.scrollFileLocHierarchy.length) {
      this.scrollReset();
      return;
    }
    this.scrollIfNeeded();
  }

  get isScrolling() {
    return this.toScrollSectionId !== undefined;
  }

  skipExpandLoc(url?: string) {
    if (!this.toScrollSectionId || !url) return false;

    const loc = getSectionInfo(url);
    if (!loc) return false;
    const reject = !this.scrollFileLocHierarchy.some((l) =>
      FileLocationEquals(l, loc)
    );

    console.log((reject ? 'reject: ' : 'accept: ') + url);
    return reject;
  }

  findNextFileLocToScrollTo() {
    if (!this.scrollFileLocHierarchy.length) return;
    for (const fileLoc of this.scrollFileLocHierarchy.slice(1)) {
      const status = this.docFragDisplayStatus.get(fileLocToString(fileLoc));
      if (!status || status !== DocFragDisplayStatus.TO_BE_SHOWN)
        return fileLoc;
    }
  }
  scrollIfNeeded() {
    if (!this.toScrollSectionId) return;
    const element = document.getElementById(this.toScrollSectionId || '');
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
      this.scrollReset();
      console.log('Scroll finished!');
      return;
    }
    const loc = this.findNextFileLocToScrollTo();
    if (!loc) return;
    console.log('Want to scroll to: ' + fileLocToString(loc));
    const ref = this.fileLocElementMap.get(fileLocToString(loc));
    if (!ref) {
      console.log('ref not found for: ' + fileLocToString(loc));
      return;
    }
    ref.scrollIntoView({ behavior: 'instant' });
  }
  /*Scroll stuff end*/

  setDocSections(s: SectionsAPIData) {
    this.docSections = s;
    this.createFileLocHeirarchy();
  }

  reportLoadedFragment(
    url: string,
    openAtLeastOnce: boolean,
    ref?: HTMLElement
  ) {
    if (!ref) return;
    //if (openAtLeastOnce) console.log('reported open: ' + url);
    const loc = getSectionInfo(url);
    this.fileLocElementMap.set(fileLocToString(loc), ref);
    this.docFragDisplayStatus.set(
      fileLocToString(loc),
      openAtLeastOnce
        ? DocFragDisplayStatus.TO_BE_SHOWN
        : DocFragDisplayStatus.PLACEHOLDER
    );
    this.scrollIfNeeded();
  }
}
