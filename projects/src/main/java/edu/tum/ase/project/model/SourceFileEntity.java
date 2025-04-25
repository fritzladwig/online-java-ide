package edu.tum.ase.project.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "SOURCEFILE", uniqueConstraints = {@UniqueConstraint(columnNames = {"name", "project"})})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@NoArgsConstructor
public class SourceFileEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Lob
    private String code;

    @ManyToOne
    @JoinColumn(nullable=false)
    private ProjectEntity project;

    public SourceFileEntity(String name, String code, ProjectEntity project) {
        this.name = name;
        this.code = code;
        this.project = project;
    }
}
