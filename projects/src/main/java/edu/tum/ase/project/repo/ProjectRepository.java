package edu.tum.ase.project.repo;

import edu.tum.ase.project.model.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, UUID> {
    List<ProjectEntity> findByUserIdOrderByNameAsc(UUID userId);
    Optional<ProjectEntity> findByIdAndUserId(UUID id, UUID userId);
}
