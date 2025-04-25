package edu.tum.ase.compiler.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SourceFile {
    private String code;
    private String name;
}
