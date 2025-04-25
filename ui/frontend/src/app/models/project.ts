import { SourceFile } from "./sourceFile";

export type Project = {
    id: string;
    name: string;
    sourceFiles: SourceFile[];
}