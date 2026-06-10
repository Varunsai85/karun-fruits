package com.karunfruits.controller;

import com.karunfruits.entity.Category;
import com.karunfruits.exception.ResourceNotFoundException;
import com.karunfruits.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findByActiveTrueOrderBySortOrderAsc());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Category> getBySlug(@PathVariable String slug) {
        return categoryRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }
}
