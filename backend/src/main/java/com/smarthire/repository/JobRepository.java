package com.smarthire.repository;

import com.smarthire.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
            select j from Job j
            where j.status = :status
              and (lower(j.title) like lower(concat('%', :q, '%'))
                   or lower(j.companyName) like lower(concat('%', :q, '%'))
                   or lower(j.location) like lower(concat('%', :q, '%')))
              and lower(j.requiredSkills) like lower(concat('%', :skill, '%'))
              and j.experience <= :maxExperience
            order by j.createdAt desc
            """)
    List<Job> search(@Param("status") Job.Status status,
                     @Param("q") String q,
                     @Param("skill") String skill,
                     @Param("maxExperience") int maxExperience);

    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    long countByRecruiterId(Long recruiterId);
}
