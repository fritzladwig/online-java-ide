package edu.tum.ase.project.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@AllArgsConstructor
@Getter
@Setter
public class ProjectListEntry {
    private UUID id;
    private String name;

    public ProjectListEntry(ProjectEntity project) {
        this.id = project.getId();
        this.name = project.getName();
    }
}
