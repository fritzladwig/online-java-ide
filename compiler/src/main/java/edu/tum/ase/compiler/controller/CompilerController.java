package edu.tum.ase.compiler.controller;

import edu.tum.ase.compiler.model.CompilationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.tum.ase.compiler.model.ExecutionResult;
import edu.tum.ase.compiler.service.CompilerService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/compile")
@RequiredArgsConstructor
public class CompilerController {
    private final CompilerService compilerService;

    @PostMapping
    public ResponseEntity<ExecutionResult> compileAndRun(@RequestBody CompilationRequest request) {
        if (request == null || request.getSourceFiles() == null || request.getSourceFiles().isEmpty()) {
            return ResponseEntity.badRequest().body(new ExecutionResult(null, "No source files provided.", false));
        }
        if (request.getSourceFiles().stream().anyMatch(sf -> sf.getName() == null || sf.getCode() == null)) {
            return ResponseEntity.badRequest().body(new ExecutionResult(null, "Source file name and code cannot be null.", false));
        }
        if (request.getCommandLineArgs() == null) {
            request.setCommandLineArgs(List.of());
        }

        try {
            ExecutionResult result = compilerService.compileAndRun(request);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ExecutionResult(null, e.getMessage(), false));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ExecutionResult(null, "Internal server error: " + e.getMessage(), false));
        }
    }
}
