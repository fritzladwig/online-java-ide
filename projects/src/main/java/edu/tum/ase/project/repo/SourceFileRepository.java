package edu.tum.ase.project.repo;

import edu.tum.ase.project.model.SourceFileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SourceFileRepository extends JpaRepository<SourceFileEntity, UUID> {
}
