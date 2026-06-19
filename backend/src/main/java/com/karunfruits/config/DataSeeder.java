package com.karunfruits.config;

import com.karunfruits.entity.Category;
import com.karunfruits.entity.Product;
import com.karunfruits.entity.ProductImage;
import com.karunfruits.entity.ProductVariant;
import com.karunfruits.repository.CategoryRepository;
import com.karunfruits.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the database with realistic catalog data on first startup.
 * Only runs when the products table is empty, so it never overwrites real data.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    private record SeedProduct(
            String name, String weightLabel, int weight, String unit,
            int price, Integer salePrice, int stock, String sku,
            boolean featured, boolean bestseller, boolean isNew,
            double rating, int reviewCount, String imageUrl
    ) {}

    private record SeedCategory(
            String name, String slug, String description, String imageUrl, int sortOrder, List<SeedProduct> products
    ) {}

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) return;

        for (SeedCategory sc : seedData()) {
            Category category = categoryRepository.findBySlug(sc.slug())
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name(sc.name())
                            .slug(sc.slug())
                            .description(sc.description())
                            .imageUrl(sc.imageUrl())
                            .active(true)
                            .sortOrder(sc.sortOrder())
                            .build()));

            for (SeedProduct sp : sc.products()) {
                String slug = (sc.slug() + "-" + sp.name())
                        .toLowerCase()
                        .replaceAll("[^a-z0-9]+", "-")
                        .replaceAll("(^-|-$)", "");

                Product product = Product.builder()
                        .name(sp.name())
                        .slug(slug)
                        .description("Premium quality " + sp.name().toLowerCase()
                                + ", carefully sourced and packed to preserve freshness and nutrition.")
                        .category(category)
                        .price(BigDecimal.valueOf(sp.price()))
                        .salePrice(sp.salePrice() != null ? BigDecimal.valueOf(sp.salePrice()) : null)
                        .stock(sp.stock())
                        .weight(sp.weight())
                        .unit(sp.unit())
                        .sku(sp.sku())
                        .active(true)
                        .featured(sp.featured())
                        .bestseller(sp.bestseller())
                        .isNew(sp.isNew())
                        .rating(BigDecimal.valueOf(sp.rating()))
                        .reviewCount(sp.reviewCount())
                        .build();

                product.getImages().add(ProductImage.builder()
                        .product(product)
                        .url(sp.imageUrl())
                        .primary(true)
                        .sortOrder(0)
                        .build());

                product.getVariants().add(ProductVariant.builder()
                        .product(product)
                        .name(sp.weightLabel())
                        .weight(sp.weight())
                        .unit(sp.unit())
                        .price(BigDecimal.valueOf(sp.price()))
                        .salePrice(sp.salePrice() != null ? BigDecimal.valueOf(sp.salePrice()) : null)
                        .stock(sp.stock())
                        .build());

                productRepository.save(product);
            }
        }
    }

    private List<SeedCategory> seedData() {
        String img1 = "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop";
        String img2 = "https://images.unsplash.com/photo-1574570068036-f8f3bfb79571?w=600&h=600&fit=crop";
        String img3 = "https://images.unsplash.com/photo-1604506818543-d45ca0f04a3a?w=600&h=600&fit=crop";
        String img4 = "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&h=600&fit=crop";

        return List.of(
                new SeedCategory("Almonds", "almonds", "Hand-picked premium almonds sourced from the finest orchards.", img1, 1, List.of(
                        new SeedProduct("Premium California Almonds", "500g", 500, "g", 599, 499, 80, "ALM-CAL-500", true, true, false, 4.7, 128, img1),
                        new SeedProduct("Mamra Almonds Premium", "250g", 250, "g", 899, null, 40, "ALM-MAM-250", false, false, true, 4.5, 64, img2),
                        new SeedProduct("Roasted Salted Almonds", "400g", 400, "g", 449, 399, 60, "ALM-RST-400", false, false, false, 4.3, 52, img3)
                )),
                new SeedCategory("Cashews", "cashews", "Creamy, whole cashews graded for size and quality.", img2, 2, List.of(
                        new SeedProduct("Whole Cashews W240", "500g", 500, "g", 699, 599, 70, "CSH-W240-500", true, false, false, 4.6, 96, img2),
                        new SeedProduct("Roasted Cashew Nuts", "250g", 250, "g", 399, null, 55, "CSH-RST-250", false, true, false, 4.4, 70, img3),
                        new SeedProduct("Broken Cashew Pieces", "500g", 500, "g", 549, 499, 45, "CSH-BRK-500", false, false, false, 4.1, 30, img4)
                )),
                new SeedCategory("Pistachios", "pistachios", "Iranian and Californian pistachios, lightly roasted and salted.", img3, 3, List.of(
                        new SeedProduct("Iranian Pistachios", "250g", 250, "g", 849, 749, 50, "PIS-IRN-250", true, false, false, 4.8, 110, img3),
                        new SeedProduct("Roasted Salted Pistachios", "250g", 250, "g", 799, null, 35, "PIS-RST-250", false, false, true, 4.5, 40, img1),
                        new SeedProduct("California Pistachios", "500g", 500, "g", 1499, 1349, 25, "PIS-CAL-500", false, false, false, 4.6, 58, img2)
                )),
                new SeedCategory("Walnuts", "walnuts", "Kashmiri and Californian walnuts, rich and nutritious.", img4, 4, List.of(
                        new SeedProduct("Walnut Kernels Premium", "500g", 500, "g", 649, 599, 65, "WAL-KER-500", true, false, false, 4.4, 84, img4),
                        new SeedProduct("Kashmiri Walnuts In-Shell", "1kg", 1000, "g", 799, null, 30, "WAL-KSH-1000", false, true, false, 4.3, 45, img1),
                        new SeedProduct("Walnut Halves & Pieces", "250g", 250, "g", 349, 299, 50, "WAL-HLV-250", false, false, false, 4.0, 22, img2)
                )),
                new SeedCategory("Dates & Figs", "dates", "Soft, naturally sweet dates and dried figs.", img1, 5, List.of(
                        new SeedProduct("Medjool Dates", "500g", 500, "g", 499, 449, 90, "DAT-MED-500", true, false, false, 4.7, 132, img1),
                        new SeedProduct("Dried Figs (Anjeer)", "250g", 250, "g", 449, null, 40, "FIG-ANJ-250", false, false, true, 4.5, 58, img3),
                        new SeedProduct("Ajwa Dates Premium", "400g", 400, "g", 699, 649, 35, "DAT-AJW-400", false, false, false, 4.6, 39, img4)
                )),
                new SeedCategory("Seeds", "seeds", "Nutrient-dense seeds for a healthy daily diet.", img2, 6, List.of(
                        new SeedProduct("Pumpkin Seeds", "250g", 250, "g", 349, 299, 60, "SED-PUM-250", true, false, false, 4.3, 47, img2),
                        new SeedProduct("Chia Seeds", "200g", 200, "g", 199, null, 75, "SED-CHI-200", false, true, false, 4.2, 60, img3),
                        new SeedProduct("Flax Seeds", "250g", 250, "g", 149, 129, 80, "SED-FLX-250", false, false, false, 4.0, 25, img4)
                )),
                new SeedCategory("Makhana", "makhana", "Light, crunchy fox nuts roasted to perfection.", img3, 7, List.of(
                        new SeedProduct("Roasted Makhana Classic", "100g", 100, "g", 249, 199, 70, "MAK-CLS-100", true, false, false, 4.4, 71, img3),
                        new SeedProduct("Peri Peri Makhana", "100g", 100, "g", 269, null, 50, "MAK-PER-100", false, false, true, 4.3, 33, img4),
                        new SeedProduct("Plain Fox Nuts", "200g", 200, "g", 399, 349, 45, "MAK-PLN-200", false, false, false, 4.1, 18, img1)
                )),
                new SeedCategory("Gift Boxes", "gift-boxes", "Curated dry fruit hampers for every celebration.", img4, 8, List.of(
                        new SeedProduct("Festive Dry Fruit Gift Box", "1kg", 1000, "g", 1499, 1299, 30, "GFT-FST-1000", true, false, false, 4.9, 88, img4),
                        new SeedProduct("Diwali Special Hamper", "1.5kg", 1500, "g", 1999, 1799, 20, "GFT-DIW-1500", false, true, false, 4.7, 64, img1),
                        new SeedProduct("Premium Assorted Nuts Box", "750g", 750, "g", 1199, null, 25, "GFT-ASR-750", false, false, false, 4.5, 41, img2)
                ))
        );
    }
}
