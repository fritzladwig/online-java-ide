package edu.tum.ase.project.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "PROJECT", uniqueConstraints = {@UniqueConstraint(columnNames = {"userId", "name"})})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@NoArgsConstructor
public class ProjectEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    @JsonIgnore
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @OneToMany(cascade = CascadeType.ALL,
            mappedBy="project",
            orphanRemoval = true,
            fetch = FetchType.EAGER)
    @OrderBy("name ASC")
    private List<SourceFileEntity> sourceFiles = new ArrayList<>();
}