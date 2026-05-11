package com.sih.edlearn.repository;

import com.sih.edlearn.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

//    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
//           "AND (a.expireDate IS NULL OR a.expireDate > :now) " +
//           "AND (a.targetRole = 'ALL' OR a.targetRole = :role) " +
//           "ORDER BY a.publishDate DESC")
//    Page<Announcement> findActiveByRole(Announcement.TargetRole role,
//                                        LocalDateTime now, Pageable pageable);

    @Query("SELECT a FROM Announcement a WHERE a.isActive = true " +
            "AND (a.expireDate IS NULL OR a.expireDate > :now) " +
            "AND (a.targetRole = 'ALL' OR a.targetRole = :role) " +
            "ORDER BY a.publishDate DESC")
    Page<Announcement> findActiveByRole(
            @Param("role") Announcement.TargetRole role,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );
}

