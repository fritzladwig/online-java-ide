package edu.tum.ase.compiler.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ExecutionResult {
    private String stdout;
    private String stderr;
    private boolean compilable;
}

