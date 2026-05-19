declare module "adm-zip" {
  import type { Buffer } from "node:buffer";

  class AdmZip {
    constructor(entry?: string | Buffer | null);

    addFile(entryName: string, buffer: Buffer, comment?: string, overwrite?: boolean): void;
    addLocalFile(entryName: string, comment?: string, overwrite?: boolean): void;
    toBuffer(): Buffer;
    readAsText(entryName: string): string;
    getEntries(): AdmZipEntry[];
    deleteFile(entryName: string): void;
  }

  class AdmZipEntry {
    readonly fileName: string;
    readonly comment: string;
    readonly uncompressedSize: number;
    readonly isDirectory: boolean;
    readonly isFile: boolean;
    entryName: string;
    getData(): Buffer;
  }

  export = AdmZip;
}
