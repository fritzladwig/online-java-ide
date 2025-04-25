package edu.tum.ase.project.service;

import edu.tum.ase.project.model.ProjectEntity;
import edu.tum.ase.project.model.ProjectListEntry;
import edu.tum.ase.project.model.SourceFileEntity;
import edu.tum.ase.project.repo.ProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional
    public ProjectEntity createProject(ProjectEntity project, UUID userId) {
        for (SourceFileEntity file : project.getSourceFiles()) {
            file.setProject(project);
        }
        project.setUserId(userId);
        return projectRepository.save(project);
    }

    @Transactional
    public ProjectEntity getProject(UUID projectId, UUID userId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with ID: " + projectId));
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        Optional<ProjectEntity> project = projectRepository.findById(projectId);
        if (project.isPresent() && project.get().getUserId().equals(userId)) {
            projectRepository.deleteById(projectId);
        }
    }

    @Transactional
    public List<ProjectListEntry> getProjects(UUID userId) {
        return projectRepository.findByUserIdOrderByNameAsc(userId).stream()
                .map(ProjectListEntry::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectEntity updateProject(UUID projectId, ProjectEntity updatedProject, UUID userId) {

        ProjectEntity existingProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with ID: " + projectId));

        if(!existingProject.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with ID: " + projectId);
        }

        if (updatedProject.getId() != null && !projectId.equals(updatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change project ID");
        }

        if (updatedProject.getUserId() != null && !projectId.equals(updatedProject.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change user ID");
        }

        existingProject.setName(updatedProject.getName());
        syncSourceFiles(existingProject, updatedProject.getSourceFiles());

        return projectRepository.save(existingProject);
    }

    @Transactional
    public void syncSourceFiles(ProjectEntity existingProject, List<SourceFileEntity> incomingSourceFiles) {
        List<SourceFileEntity> currentSourceFiles = new ArrayList<>(existingProject.getSourceFiles());

        List<SourceFileEntity> filesToRemove = currentSourceFiles.stream()
                .filter(currentFile -> incomingSourceFiles.stream()
                        .noneMatch(newFile -> Objects.equals(currentFile.getName(), newFile.getName()))
                ).toList();

        existingProject.getSourceFiles().removeAll(filesToRemove);

        for (SourceFileEntity incomingFile : incomingSourceFiles) {
            Optional<SourceFileEntity> existingFile = existingProject.getSourceFiles().stream()
                    .filter(sf -> Objects.equals(sf.getName(), incomingFile.getName()))
                    .findFirst();

            if (existingFile.isPresent()) {
                SourceFileEntity fileToUpdate = existingFile.get();
                fileToUpdate.setCode(incomingFile.getCode());
            } else {
                SourceFileEntity newSourceFile = new SourceFileEntity(incomingFile.getName(), incomingFile.getCode(), existingProject);
                existingProject.getSourceFiles().add(newSourceFile);
            }
        }
    }
}
