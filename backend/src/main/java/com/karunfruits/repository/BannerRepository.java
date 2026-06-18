package com.karunfruits.repository;

import com.karunfruits.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findAllByOrderBySortOrderAsc();
    List<Banner> findByActiveTrueOrderBySortOrderAsc();
}
