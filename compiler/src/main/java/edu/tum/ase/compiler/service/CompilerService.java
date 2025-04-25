package edu.tum.ase.compiler.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import edu.tum.ase.compiler.model.CompilationRequest;
import org.springframework.stereotype.Service;

import edu.tum.ase.compiler.model.ExecutionResult;
import edu.tum.ase.compiler.model.SourceFile;

@Service
public class CompilerService {

    private static final long COMPILE_TIMEOUT_SECONDS = 15;
    private static final long EXECUTION_TIMEOUT_SECONDS = 15;

    private String getProcessOutput(InputStream inputStream) throws IOException {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append(System.lineSeparator());
            }
        }
        return output.toString();
    }

    private static String getMainClassName(CompilationRequest request) {
        String mainClassName = request.getMainClassName();
        if (mainClassName == null || mainClassName.isBlank()) {
            if (!request.getSourceFiles().isEmpty()) {
                String firstFileName = request.getSourceFiles().get(0).getName();
                if (firstFileName.endsWith(".java")) {
                    mainClassName = firstFileName.substring(0, firstFileName.length() - 5);
                } else {
                    throw new IllegalArgumentException("Cannot determine main class: First file name invalid.");
                }
            } else {
                throw new IllegalArgumentException("Cannot determine main class: No source files provided.");
            }
        }
        if(mainClassName.endsWith(".java")) {
            mainClassName = mainClassName.substring(0, mainClassName.length() - 5);
        }
        if (!mainClassName.matches("[a-zA-Z_$][a-zA-Z\\d_$]*")) {
            throw new IllegalArgumentException("Invalid main class name format: " + mainClassName);
        }
        return mainClassName;
    }

    private void deleteDirectoryRecursively(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            Files.walkFileTree(path, new SimpleFileVisitor<>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } else {
            Files.deleteIfExists(path);
        }
    }

    private boolean compile(List<Path> javaFilePaths, Path workingDirectory, StringBuilder compileError) {
        if (javaFilePaths.isEmpty()) {
            compileError.append("No Java files found to compile.");
            return false;
        }

        List<String> command = new ArrayList<>();
        command.add("javac");
        javaFilePaths.forEach(path -> command.add(path.toString()));

        ProcessBuilder compileProcessBuilder = new ProcessBuilder(command);
        compileProcessBuilder.directory(workingDirectory.toFile());

        Process compileProcess;
        try {
            compileProcess = compileProcessBuilder.start();
            String errors = getProcessOutput(compileProcess.getErrorStream());
            boolean finished = compileProcess.waitFor(COMPILE_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                compileProcess.destroyForcibly();
                compileError.append("Compilation timed out after ").append(COMPILE_TIMEOUT_SECONDS).append(" seconds.");
                return false;
            }

            int exitCode = compileProcess.exitValue();
            if (exitCode != 0) {
                compileError.append(errors);
                return false;
            }
            if (!errors.isBlank()) {
                compileError.append("Compilation warnings/messages:\n").append(errors);
            }

        } catch (IOException | InterruptedException e) {
            compileError.append("Failed to execute compile process: ").append(e.getMessage());
            Thread.currentThread().interrupt();
            return false;
        }
        return true;
    }

    private void run(String mainClassName, List<String> args, Path workingDirectory, StringBuilder stdout, StringBuilder stderr) {
        List<String> command = new ArrayList<>();
        command.add("java");
        command.add(mainClassName);
        command.addAll(args);

        ProcessBuilder runProcessBuilder = new ProcessBuilder(command);
        runProcessBuilder.directory(workingDirectory.toFile());

        Process runProcess;
        try {
            runProcess = runProcessBuilder.start();

            String output = getProcessOutput(runProcess.getInputStream());
            String errors = getProcessOutput(runProcess.getErrorStream());

            boolean finished = runProcess.waitFor(EXECUTION_TIMEOUT_SECONDS, TimeUnit.SECONDS);

            if (!finished) {
                runProcess.destroyForcibly();
                stderr.append("Execution timed out after ").append(EXECUTION_TIMEOUT_SECONDS).append(" seconds.");
                return;
            }

            stdout.append(output);
            if (!errors.isBlank()) {
                stderr.append(errors);
            }
        } catch (IOException | InterruptedException e) {
            stderr.append("Failed to execute run process: ").append(e.getMessage());
            Thread.currentThread().interrupt(); // Restore interrupted status
        }
    }

    public ExecutionResult compileAndRun(CompilationRequest request) {
        StringBuilder compileError = new StringBuilder();
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        boolean compilable;
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("compile-run-");
            List<Path> sourceFilePaths = new ArrayList<>();

            for (SourceFile sourceFile : request.getSourceFiles()) {
                String fileName = sourceFile.getName();
                if (fileName == null || !fileName.endsWith(".java")) {
                    throw new IllegalArgumentException("Invalid file name: '" + fileName + "'. Must end with .java");
                }
                Path filePath = tempDir.resolve(fileName);
                if (!filePath.normalize().startsWith(tempDir)) {
                    throw new IllegalArgumentException("Invalid file name detected (path traversal attempt): " + fileName);
                }
                Files.writeString(filePath, sourceFile.getCode(), StandardOpenOption.CREATE);
                sourceFilePaths.add(filePath);
            }
            String mainClassName = getMainClassName(request);
            
            compilable = compile(sourceFilePaths, tempDir, compileError);
            stderr.append(compileError);

            if (compilable) {
                if (!compileError.isEmpty() && !compileError.toString().endsWith(System.lineSeparator())) {
                    stderr.append(System.lineSeparator());
                }
                run(mainClassName, request.getCommandLineArgs(), tempDir, stdout, stderr);
            }

        } catch (IOException e) {
            stderr.append("IO Error during setup or file operations: ").append(e.getMessage());
            compilable = false;
        } catch (IllegalArgumentException e) {
            stderr.append("Error: ").append(e.getMessage());
            compilable = false;
        } finally {
            if (tempDir != null) {
                try {
                    deleteDirectoryRecursively(tempDir);
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete temporary directory " + tempDir + ": " + e.getMessage());
                }
            }
        }
        return new ExecutionResult(stdout.toString(), stderr.toString(), compilable);
    }
}
