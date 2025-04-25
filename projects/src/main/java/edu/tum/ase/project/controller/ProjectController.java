package edu.tum.ase.project.controller;

import edu.tum.ase.project.model.ProjectEntity;
import edu.tum.ase.project.model.ProjectListEntry;
import edu.tum.ase.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectListEntry>> getAllProjects(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(projectService.getProjects(UUID.fromString(jwt.getSubject())));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectEntity> getProject(@PathVariable UUID projectId, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(projectService.getProject(projectId, UUID.fromString(jwt.getSubject())));
    }

    @PostMapping
    public ResponseEntity<ProjectEntity> createProject(@RequestBody ProjectEntity project, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(project, UUID.fromString(jwt.getSubject())));
    }

    @PatchMapping("/{projectId}")
    public ResponseEntity<ProjectEntity> updateProject(
            @PathVariable UUID projectId,
            @RequestBody ProjectEntity project,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.status(HttpStatus.OK).body(projectService.updateProject(projectId, project, UUID.fromString(jwt.getSubject())));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID projectId, @AuthenticationPrincipal Jwt jwt) {
        projectService.deleteProject(projectId, UUID.fromString(jwt.getSubject()));
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
