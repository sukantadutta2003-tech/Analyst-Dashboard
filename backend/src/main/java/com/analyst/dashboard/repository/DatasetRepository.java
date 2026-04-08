package com.analyst.dashboard.repository;

import com.analyst.dashboard.model.Dataset;
import com.analyst.dashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    List<Dataset> findAllByOrderByUploadedAtDesc();
    List<Dataset> findByUserOrderByUploadedAtDesc(User user);
    Optional<Dataset> findByIdAndUser(Long id, User user);
}
