import {SourceFile} from "./sourceFile";

export type CompilationRequest = {
    sourceFiles: SourceFile[];
    commandLineArgs: string[];
    mainClassName: string;
}