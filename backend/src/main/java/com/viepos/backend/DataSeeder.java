package com.viepos.backend;

import com.viepos.backend.models.Category;
import com.viepos.backend.models.Product;
import com.viepos.backend.models.Card;
import com.viepos.backend.repositories.CategoryRepository;
import com.viepos.backend.repositories.ProductRepository;
import com.viepos.backend.repositories.CardRepository;
import com.viepos.backend.repositories.CardSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardSessionRepository cardSessionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            Category c1 = categoryRepository.save(new Category(null, "Cà phê"));
            Category c2 = categoryRepository.save(new Category(null, "Trà sữa"));
            Category c3 = categoryRepository.save(new Category(null, "Nước ép"));
            Category c4 = categoryRepository.save(new Category(null, "Trà"));
            Category c5 = categoryRepository.save(new Category(null, "Ăn vặt"));

            if (productRepository.count() == 0) {
                productRepository.save(new Product(null, "CF-DEN-01", "Cà phê đen", null, "Đang bán", c1));
                productRepository.save(new Product(null, "CF-SUA-02", "Cà phê sữa", null, "Đang bán", c1));
                
                productRepository.save(new Product(null, "TS-DAC-01", "Trà sữa đặc sản", null, "Đang bán", c2));
                productRepository.save(new Product(null, "TS-TRU-02", "Trà sữa truyền thống", null, "Đang bán", c2));
                
                productRepository.save(new Product(null, "NE-DEP-01", "Đẹp da", null, "Đang bán", c3));
                productRepository.save(new Product(null, "NE-DAN-02", "Đẹp dáng", null, "Đang bán", c3));
                
                productRepository.save(new Product(null, "TR-NHT-01", "Trà trái cây nhiệt đới", null, "Đang bán", c4));
                productRepository.save(new Product(null, "TR-MAN-02", "Trà mãng cầu", null, "Đang bán", c4));
                productRepository.save(new Product(null, "TR-OIH-03", "Trà ổi hồng", null, "Đang bán", c4));
                productRepository.save(new Product(null, "TR-HIB-04", "Trà Hibiscus", null, "Đang bán", c4));
                productRepository.save(new Product(null, "TR-XOA-05", "Trà xoài chanh leo", null, "Đang bán", c4));
                productRepository.save(new Product(null, "TR-DET-06", "Trà detox nóng", null, "Đang bán", c4));
                
                productRepository.save(new Product(null, "AV-MILY-01", "Mì ly", null, "Đang bán", c5));
                productRepository.save(new Product(null, "AV-BGAU-02", "Bánh gấu", null, "Đang bán", c5));
                productRepository.save(new Product(null, "AV-BQUE-03", "Bánh que", null, "Đang bán", c5));
                productRepository.save(new Product(null, "AV-BTM-04", "Bánh tai mèo", null, "Đang bán", c5));
                productRepository.save(new Product(null, "AV-BDT-05", "Bánh đồng tiền", null, "Đang bán", c5));
            }
        }

        if (cardRepository.count() != 12) {
            cardSessionRepository.deleteAll();
            cardRepository.deleteAll();
            String[] cardNumbers = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};
            for (String cardNumber : cardNumbers) {
                cardRepository.save(new Card(null, cardNumber, "trống"));
            }
        }
    }
}
