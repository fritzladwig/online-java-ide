package edu.tum.ase.compiler.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CompilationRequest {
    private List<SourceFile> sourceFiles;
    private List<String> commandLineArgs;
    private String mainClassName;
}
